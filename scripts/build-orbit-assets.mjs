import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { constants as fsConstants } from "node:fs";
import {
  copyFile,
  mkdtemp,
  readFile,
  rm,
  stat,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, join, relative, resolve, sep } from "node:path";

import { NodeIO } from "@gltf-transform/core";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";
import {
  getBounds,
  listTextureSlots,
  meshopt,
  textureCompress,
} from "@gltf-transform/functions";
import { validateBytes } from "gltf-validator";
import {
  MeshoptDecoder as TransformMeshoptDecoder,
  MeshoptEncoder,
} from "meshoptimizer";
import sharp from "sharp";
import * as THREE from "three";
import { MeshoptDecoder as ThreeMeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

// First build: `npm run assets:orbit`.
// Intentional replacement of these exact generated derivatives: `npm run assets:orbit -- --force`.
const REPO_ROOT = resolve(import.meta.dirname, "..");
const OUTPUT_ROOT = resolve(REPO_ROOT, "public/experience/orbit/models");
const MANIFEST_PATH = resolve(REPO_ROOT, "docs/orbit-web-asset-manifest.json");
const FORCE = process.argv.includes("--force");

const COLOR_SLOTS = /^(baseColorTexture|emissiveTexture)$/;
const DATA_SLOTS = /^(normalTexture|metallicRoughnessTexture|occlusionTexture)$/;
const WEBP_QUALITY = 90;
const WEBP_EFFORT = 100;
const COMPACT_MAX_TEXTURE_SIZE = 1024;
const POSITION_BITS = 16;
const NORMAL_BITS = 12;
const TEXCOORD_BITS = 14;

const ASSETS = [
  {
    id: "designs",
    source: resolve(REPO_ROOT, "public/experience/pen/westcose_designs.glb"),
    outputStem: "westcose_designs",
  },
  {
    id: "labs",
    source: resolve(
      REPO_ROOT,
      "public/experience/orbit/models/wc_building_westcose_labs_01_server_satellite_refined.glb",
    ),
    outputStem: "wc_building_westcose_labs_01_server_satellite_refined",
  },
  {
    id: "shop",
    source: resolve(
      REPO_ROOT,
      "public/experience/orbit/models/wc_building_westcose_shop_01_apparel_exterior.glb",
    ),
    outputStem: "wc_building_westcose_shop_01_apparel_exterior",
  },
];

const TIERS = [
  { id: "full", textureLimit: null },
  { id: "compact", textureLimit: COMPACT_MAX_TEXTURE_SIZE },
];

const io = new NodeIO()
  .registerExtensions(ALL_EXTENSIONS)
  .registerDependencies({
    "meshopt.decoder": TransformMeshoptDecoder,
    "meshopt.encoder": MeshoptEncoder,
  });

function repoPath(filePath) {
  return relative(REPO_ROOT, filePath).replaceAll("\\", "/");
}

function sha256Bytes(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}

async function sha256File(filePath) {
  return sha256Bytes(await readFile(filePath));
}

function roundNumber(value) {
  return Number(value.toFixed(8));
}

function roundVector(vector) {
  return vector.map(roundNumber);
}

function canonicalize(value) {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (!value || typeof value !== "object") return value;

  return Object.fromEntries(
    Object.keys(value)
      .sort()
      .map((key) => [key, canonicalize(value[key])]),
  );
}

function canonicalHash(value) {
  return sha256Bytes(JSON.stringify(canonicalize(value)));
}

function normalizedMaterialSignature(json) {
  const samplerDefaults = {
    magFilter: 9729,
    minFilter: 9987,
    wrapS: 10497,
    wrapT: 10497,
  };

  const textureIdentity = (textureIndex) => {
    const texture = json.textures?.[textureIndex];
    if (!texture) throw new Error(`Material references missing texture ${textureIndex}.`);
    const sourceIndex =
      texture.extensions?.EXT_texture_webp?.source ??
      texture.extensions?.EXT_texture_avif?.source ??
      texture.source;
    const image = json.images?.[sourceIndex];
    if (!image) throw new Error(`Texture ${textureIndex} references missing image ${sourceIndex}.`);
    const sampler = json.samplers?.[texture.sampler] ?? {};

    return {
      image: image.name ?? `unnamed-image-${sourceIndex}`,
      sampler: {
        magFilter: sampler.magFilter ?? samplerDefaults.magFilter,
        minFilter: sampler.minFilter ?? samplerDefaults.minFilter,
        wrapS: sampler.wrapS ?? samplerDefaults.wrapS,
        wrapT: sampler.wrapT ?? samplerDefaults.wrapT,
      },
    };
  };

  const replaceTextureIndices = (value) => {
    if (Array.isArray(value)) return value.map(replaceTextureIndices);
    if (!value || typeof value !== "object") return value;

    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [
        key,
        key === "index" && typeof entry === "number"
          ? textureIdentity(entry)
          : replaceTextureIndices(entry),
      ]),
    );
  };

  return canonicalHash(replaceTextureIndices(json.materials ?? []));
}

function readGlbJson(bytes) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  if (view.getUint32(0, true) !== 0x46546c67) {
    throw new Error("Expected a binary glTF (GLB) file.");
  }
  if (view.getUint32(4, true) !== 2) {
    throw new Error("Expected glTF 2.0.");
  }
  if (view.getUint32(16, true) !== 0x4e4f534a) {
    throw new Error("GLB JSON chunk is missing.");
  }

  const jsonLength = view.getUint32(12, true);
  const jsonBytes = bytes.subarray(20, 20 + jsonLength);
  return JSON.parse(new TextDecoder().decode(jsonBytes).trimEnd());
}

function triangleCountForPrimitive(primitive) {
  const position = primitive.getAttribute("POSITION");
  const drawCount = primitive.getIndices()?.getCount() ?? position?.getCount() ?? 0;

  switch (primitive.getMode()) {
    case 4:
      return Math.floor(drawCount / 3);
    case 5:
    case 6:
      return Math.max(0, drawCount - 2);
    default:
      return 0;
  }
}

function combineSceneBounds(scenes) {
  const min = [Infinity, Infinity, Infinity];
  const max = [-Infinity, -Infinity, -Infinity];

  for (const scene of scenes) {
    const bounds = getBounds(scene);
    for (let axis = 0; axis < 3; axis += 1) {
      min[axis] = Math.min(min[axis], bounds.min[axis]);
      max[axis] = Math.max(max[axis], bounds.max[axis]);
    }
  }

  if (!min.every(Number.isFinite) || !max.every(Number.isFinite)) {
    throw new Error("Could not compute finite scene bounds.");
  }

  return {
    min: roundVector(min),
    max: roundVector(max),
    size: roundVector(max.map((value, axis) => value - min[axis])),
  };
}

function textureRole(slots) {
  const hasColor = slots.some((slot) => COLOR_SLOTS.test(slot));
  const hasData = slots.some((slot) => DATA_SLOTS.test(slot));
  const unsupported = slots.filter(
    (slot) => !COLOR_SLOTS.test(slot) && !DATA_SLOTS.test(slot),
  );

  if (unsupported.length > 0) {
    throw new Error(`Unsupported texture slots: ${unsupported.join(", ")}`);
  }
  if (hasColor && hasData) {
    throw new Error(
      `A texture is shared by color and data slots (${slots.join(", ")}); refusing an ambiguous encoding.`,
    );
  }
  if (!hasColor && !hasData) {
    throw new Error("A texture has no recognized material slot; refusing to transform it implicitly.");
  }

  return hasColor ? "color-q90" : "data-lossless";
}

async function inspectDocument(filePath) {
  const bytes = await readFile(filePath);
  const json = readGlbJson(bytes);
  const document = await io.read(filePath);
  const root = document.getRoot();
  const primitiveSignatures = [];
  let primitiveCount = 0;
  let vertexCount = 0;
  let triangleCount = 0;
  let normalAccessorCount = 0;
  let tangentAccessorCount = 0;

  root.listMeshes().forEach((mesh, meshIndex) => {
    mesh.listPrimitives().forEach((primitive, primitiveIndex) => {
      const position = primitive.getAttribute("POSITION");
      const indices = primitive.getIndices();
      const attributes = primitive.listSemantics().sort();
      const targets = primitive.listTargets().map((target) => target.listSemantics().sort());

      primitiveCount += 1;
      vertexCount += position?.getCount() ?? 0;
      triangleCount += triangleCountForPrimitive(primitive);
      normalAccessorCount += attributes.includes("NORMAL") ? 1 : 0;
      tangentAccessorCount += attributes.includes("TANGENT") ? 1 : 0;
      primitiveSignatures.push({
        meshIndex,
        meshName: mesh.getName(),
        primitiveIndex,
        mode: primitive.getMode(),
        vertices: position?.getCount() ?? 0,
        indices: indices?.getCount() ?? 0,
        attributes,
        targets,
        materialName: primitive.getMaterial()?.getName() ?? null,
      });
    });
  });

  const textures = [];
  for (const [index, texture] of root.listTextures().entries()) {
    const image = texture.getImage();
    if (!image) throw new Error(`Texture ${index} has no embedded image data.`);
    const slots = listTextureSlots(texture).sort();
    const metadata = await sharp(image).metadata();
    textures.push({
      index,
      name: texture.getName(),
      uri: texture.getURI(),
      slots,
      role: textureRole(slots),
      mimeType: texture.getMimeType(),
      width: metadata.width ?? null,
      height: metadata.height ?? null,
      bytes: image.byteLength,
      sha256: sha256Bytes(image),
    });
  }

  return {
    bytes: bytes.byteLength,
    sha256: sha256Bytes(bytes),
    counts: {
      scenes: root.listScenes().length,
      nodes: root.listNodes().length,
      meshes: root.listMeshes().length,
      primitives: primitiveCount,
      vertices: vertexCount,
      triangles: triangleCount,
      materials: root.listMaterials().length,
      textures: root.listTextures().length,
      normalAccessors: normalAccessorCount,
      tangentAccessors: tangentAccessorCount,
    },
    bounds: combineSceneBounds(root.listScenes()),
    extensions: {
      used: [...(json.extensionsUsed ?? [])].sort(),
      required: [...(json.extensionsRequired ?? [])].sort(),
    },
    topologySignature: canonicalHash(primitiveSignatures),
    materialSignature: normalizedMaterialSignature(json),
    textures: textures.sort((left, right) =>
      `${left.slots.join("|")}:${left.name}`.localeCompare(
        `${right.slots.join("|")}:${right.name}`,
      ),
    ),
  };
}

function assertEqual(actual, expected, label) {
  if (actual !== expected) {
    throw new Error(`${label} changed: expected ${expected}, received ${actual}.`);
  }
}

function assertStructurePreserved(source, output, tier) {
  for (const key of [
    "scenes",
    "nodes",
    "meshes",
    "primitives",
    "vertices",
    "triangles",
    "materials",
    "textures",
    "normalAccessors",
    "tangentAccessors",
  ]) {
    assertEqual(output.counts[key], source.counts[key], `${key} count`);
  }

  assertEqual(output.topologySignature, source.topologySignature, "topology signature");
  assertEqual(output.materialSignature, source.materialSignature, "material signature");

  const maximumExtent = Math.max(...source.bounds.size, 1);
  const boundsTolerance = Math.max(0.00001, (maximumExtent * 2) / 65535);
  for (const edge of ["min", "max"]) {
    for (let axis = 0; axis < 3; axis += 1) {
      const difference = Math.abs(output.bounds[edge][axis] - source.bounds[edge][axis]);
      if (difference > boundsTolerance) {
        throw new Error(
          `Scene ${edge}[${axis}] moved by ${difference}; allowed tolerance is ${boundsTolerance}.`,
        );
      }
    }
  }

  for (const [index, texture] of output.textures.entries()) {
    const sourceTexture = source.textures[index];
    assertEqual(texture.name, sourceTexture.name, `texture ${index} name`);
    assertEqual(texture.role, sourceTexture.role, `texture ${index} role`);
    assertEqual(texture.slots.join(","), sourceTexture.slots.join(","), `texture ${index} slots`);
    assertEqual(texture.mimeType, "image/webp", `texture ${index} MIME type`);

    if (tier.textureLimit === null) {
      assertEqual(texture.width, sourceTexture.width, `texture ${index} width`);
      assertEqual(texture.height, sourceTexture.height, `texture ${index} height`);
    } else {
      if (Math.max(texture.width ?? Infinity, texture.height ?? Infinity) > tier.textureLimit) {
        throw new Error(`Texture ${index} exceeds the ${tier.textureLimit}px compact limit.`);
      }
      if (
        Math.max(sourceTexture.width ?? 0, sourceTexture.height ?? 0) > tier.textureLimit &&
        Math.max(texture.width ?? 0, texture.height ?? 0) !== tier.textureLimit
      ) {
        throw new Error(`Texture ${index} was not resized to the expected compact maximum.`);
      }
    }
  }

  if (!output.extensions.required.includes("EXT_meshopt_compression")) {
    throw new Error("EXT_meshopt_compression is not required by the derivative.");
  }
  if (!output.extensions.required.includes("EXT_texture_webp")) {
    throw new Error("EXT_texture_webp is not required by the derivative.");
  }
}

async function validatorReport(filePath) {
  const bytes = await readFile(filePath);
  const report = await validateBytes(new Uint8Array(bytes), {
    maxIssues: 100000,
    uri: basename(filePath),
  });
  return {
    errors: report.issues.numErrors,
    warnings: report.issues.numWarnings,
    infos: report.issues.numInfos,
    hints: report.issues.numHints,
    messages: report.issues.messages.map((message) => ({
      code: message.code,
      severity: message.severity,
      pointer: message.pointer,
      message: message.message,
    })),
  };
}

function runCliValidation(filePath) {
  const cliPath = resolve(REPO_ROOT, "node_modules/@gltf-transform/cli/bin/cli.js");
  const args = [cliPath, "validate", filePath, "--format", "csv"];
  const result = spawnSync(process.execPath, args, {
    cwd: REPO_ROOT,
    encoding: "utf8",
    windowsHide: true,
  });

  if (result.status !== 0) {
    throw new Error(
      `glTF Transform validation failed for ${repoPath(filePath)}:\n${result.stderr || result.stdout}`,
    );
  }

  return {
    passed: true,
    command: `gltf-transform validate ${repoPath(filePath)} --format csv`,
    exitCode: result.status,
  };
}

async function installThreeImageBitmapShim() {
  globalThis.self ??= globalThis;
  globalThis.createImageBitmap ??= async (blob) => {
    const bytes = new Uint8Array(await blob.arrayBuffer());
    const metadata = await sharp(bytes).metadata();
    return {
      width: metadata.width ?? 1,
      height: metadata.height ?? 1,
      close() {},
    };
  };
}

async function loadWithThree(filePath) {
  await installThreeImageBitmapShim();
  await ThreeMeshoptDecoder.ready;

  const bytes = await readFile(filePath);
  const arrayBuffer = bytes.buffer.slice(
    bytes.byteOffset,
    bytes.byteOffset + bytes.byteLength,
  );
  const loader = new GLTFLoader().setMeshoptDecoder(ThreeMeshoptDecoder);
  const gltf = await new Promise((resolvePromise, rejectPromise) => {
    loader.parse(arrayBuffer, "", resolvePromise, rejectPromise);
  });

  gltf.scene.updateMatrixWorld(true);
  const bounds = new THREE.Box3().setFromObject(gltf.scene, true);
  let meshes = 0;
  let materials = 0;
  gltf.scene.traverse((object) => {
    if (!object.isMesh) return;
    meshes += 1;
    materials += Array.isArray(object.material) ? object.material.length : 1;
  });

  return {
    passed: true,
    loader: "three/examples/jsm/loaders/GLTFLoader.js",
    meshoptDecoder: "three/examples/jsm/libs/meshopt_decoder.module.js",
    meshObjects: meshes,
    materialAssignments: materials,
    bounds: {
      min: roundVector(bounds.min.toArray()),
      max: roundVector(bounds.max.toArray()),
      size: roundVector(bounds.getSize(new THREE.Vector3()).toArray()),
    },
  };
}

async function buildCandidate(sourcePath, candidatePath, tier) {
  const document = await io.read(sourcePath);
  const resize = tier.textureLimit
    ? [tier.textureLimit, tier.textureLimit]
    : undefined;

  await document.transform(
    textureCompress({
      encoder: sharp,
      targetFormat: "webp",
      slots: COLOR_SLOTS,
      quality: WEBP_QUALITY,
      effort: WEBP_EFFORT,
      resize,
    }),
    textureCompress({
      encoder: sharp,
      targetFormat: "webp",
      slots: DATA_SLOTS,
      lossless: true,
      effort: WEBP_EFFORT,
      resize,
    }),
    meshopt({
      encoder: MeshoptEncoder,
      level: "medium",
      quantizationVolume: "mesh",
      quantizePosition: POSITION_BITS,
      quantizeNormal: NORMAL_BITS,
      quantizeTexcoord: TEXCOORD_BITS,
      quantizeColor: 10,
      quantizeWeight: 12,
      quantizeGeneric: 16,
    }),
  );

  await io.write(candidatePath, document);
}

async function promoteCandidate(candidatePath, outputPath) {
  await copyFile(
    candidatePath,
    outputPath,
    FORCE ? 0 : fsConstants.COPYFILE_EXCL,
  );
}

async function packageVersion(packageName) {
  const packageJson = JSON.parse(
    await readFile(resolve(REPO_ROOT, `node_modules/${packageName}/package.json`), "utf8"),
  );
  return packageJson.version;
}

async function assertTargetsAvailable() {
  const targets = [
    MANIFEST_PATH,
    ...ASSETS.flatMap((asset) =>
      TIERS.map((tier) =>
        resolve(OUTPUT_ROOT, `${asset.outputStem}.web-${tier.id}.glb`),
      ),
    ),
  ];

  if (!FORCE) {
    for (const target of targets) {
      try {
        await stat(target);
        throw new Error(
          `${repoPath(target)} already exists. Pass --force only when replacing these exact derivatives is intended.`,
        );
      } catch (error) {
        if (error.code !== "ENOENT") throw error;
      }
    }
  }
}

async function main() {
  await assertTargetsAvailable();
  await MeshoptEncoder.ready;
  await TransformMeshoptDecoder.ready;

  const temporaryRoot = await mkdtemp(join(tmpdir(), "westcose-orbit-assets-"));
  const resolvedTempRoot = resolve(temporaryRoot);
  const safeTempPrefix = `${resolve(tmpdir())}${sep}`;
  if (
    !resolvedTempRoot.startsWith(safeTempPrefix) ||
    !basename(resolvedTempRoot).startsWith("westcose-orbit-assets-")
  ) {
    throw new Error(`Refusing unsafe temporary directory: ${resolvedTempRoot}`);
  }

  try {
    const manifest = {
      schemaVersion: 1,
      generator: "scripts/build-orbit-assets.mjs",
      toolchain: {
        node: process.version,
        gltfTransformCli: await packageVersion("@gltf-transform/cli"),
        gltfTransformCore: await packageVersion("@gltf-transform/core"),
        gltfTransformFunctions: await packageVersion("@gltf-transform/functions"),
        meshoptimizer: await packageVersion("meshoptimizer"),
        sharp: sharp.versions.sharp,
        three: THREE.REVISION,
      },
      settings: {
        colorTextures: {
          slots: ["baseColorTexture", "emissiveTexture"],
          format: "image/webp",
          quality: WEBP_QUALITY,
          effort: WEBP_EFFORT,
        },
        dataTextures: {
          slots: [
            "normalTexture",
            "metallicRoughnessTexture",
            "occlusionTexture",
          ],
          format: "image/webp",
          lossless: true,
          effort: WEBP_EFFORT,
        },
        compactTextureMaximum: COMPACT_MAX_TEXTURE_SIZE,
        resizeFilter: "lanczos3",
        meshopt: {
          level: "medium",
          rationale:
            "The CLI's high level clamps normal precision to 8 bits; medium retains the requested 12-bit custom-normal precision while still applying Meshopt compression.",
          quantizationVolume: "mesh",
          positionBits: POSITION_BITS,
          normalAndTangentBits: NORMAL_BITS,
          texcoordBits: TEXCOORD_BITS,
          colorBits: 10,
          weightBits: 12,
          genericBits: 16,
          simplify: false,
          join: false,
          deduplicate: false,
          materialConsolidation: false,
          topologyChanges: false,
        },
      },
      assets: [],
      aggregate: null,
    };

    for (const asset of ASSETS) {
      const sourceHashBefore = await sha256File(asset.source);
      const sourceInspection = await inspectDocument(asset.source);
      const sourceValidation = await validatorReport(asset.source);
      if (sourceValidation.errors !== 0) {
        throw new Error(`${repoPath(asset.source)} has source validation errors.`);
      }

      const assetRecord = {
        id: asset.id,
        source: {
          path: repoPath(asset.source),
          ...sourceInspection,
          validation: sourceValidation,
        },
        derivatives: {},
        sourceHashUnchanged: false,
      };

      for (const tier of TIERS) {
        const outputPath = resolve(
          OUTPUT_ROOT,
          `${asset.outputStem}.web-${tier.id}.glb`,
        );
        const candidatePath = resolve(
          temporaryRoot,
          `${asset.outputStem}.web-${tier.id}.glb`,
        );

        process.stdout.write(`Building ${asset.id} (${tier.id})...\n`);
        await buildCandidate(asset.source, candidatePath, tier);

        const inspection = await inspectDocument(candidatePath);
        assertStructurePreserved(sourceInspection, inspection, tier);

        const validation = await validatorReport(candidatePath);
        if (validation.errors !== 0) {
          throw new Error(`${asset.id} ${tier.id} derivative has validation errors.`);
        }
        if (validation.warnings > sourceValidation.warnings) {
          throw new Error(`${asset.id} ${tier.id} derivative introduced validator warnings.`);
        }

        await promoteCandidate(candidatePath, outputPath);
        assertEqual(
          await sha256File(outputPath),
          inspection.sha256,
          `${asset.id} ${tier.id} promoted SHA-256`,
        );
        const cliValidation = runCliValidation(outputPath);
        const threeLoad = await loadWithThree(outputPath);

        assetRecord.derivatives[tier.id] = {
          path: repoPath(outputPath),
          ...inspection,
          transferReductionPercent: roundNumber(
            (1 - inspection.bytes / sourceInspection.bytes) * 100,
          ),
          validation,
          cliValidation: {
            ...cliValidation,
            command: `gltf-transform validate ${repoPath(outputPath)} --format csv`,
          },
          threeLoad,
          checks: {
            topologyCountsPreserved: true,
            topologySignaturePreserved: true,
            materialSignaturePreserved: true,
            textureSlotsPreserved: true,
            textureResolutionPolicyPassed: true,
            boundsWithinQuantizationTolerance: true,
          },
        };
      }

      const sourceHashAfter = await sha256File(asset.source);
      assertEqual(sourceHashAfter, sourceHashBefore, `${asset.id} source SHA-256`);
      assetRecord.sourceHashUnchanged = true;
      assetRecord.source.sha256After = sourceHashAfter;
      manifest.assets.push(assetRecord);
    }

    const aggregateSourceBytes = manifest.assets.reduce(
      (sum, asset) => sum + asset.source.bytes,
      0,
    );
    const aggregateFullBytes = manifest.assets.reduce(
      (sum, asset) => sum + asset.derivatives.full.bytes,
      0,
    );
    const aggregateCompactBytes = manifest.assets.reduce(
      (sum, asset) => sum + asset.derivatives.compact.bytes,
      0,
    );
    manifest.aggregate = {
      sourceBytes: aggregateSourceBytes,
      fullBytes: aggregateFullBytes,
      compactBytes: aggregateCompactBytes,
      fullTransferReductionPercent: roundNumber(
        (1 - aggregateFullBytes / aggregateSourceBytes) * 100,
      ),
      compactTransferReductionPercent: roundNumber(
        (1 - aggregateCompactBytes / aggregateSourceBytes) * 100,
      ),
      targetTransferReductionPercent: 50,
      fullTargetMet: aggregateFullBytes <= aggregateSourceBytes * 0.5,
      compactTargetMet: aggregateCompactBytes <= aggregateSourceBytes * 0.5,
    };

    await writeFile(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`, {
      encoding: "utf8",
      flag: FORCE ? "w" : "wx",
    });

    process.stdout.write(
      `Orbit assets complete. Full reduction: ${manifest.aggregate.fullTransferReductionPercent}%. Compact reduction: ${manifest.aggregate.compactTransferReductionPercent}%.\n`,
    );
  } finally {
    await rm(temporaryRoot, { recursive: true, force: true });
  }
}

await main();
