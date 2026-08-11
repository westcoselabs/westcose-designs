export type NavigationItem = {
  readonly label: string;
  readonly href: `/${string}` | "/";
  readonly indicator?: "↗";
};

export const primaryNavigation = [
  { label: "Work", href: "/work" },
  { label: "Services", href: "/services" },
  { label: "Studio", href: "/studio" },
] as const satisfies readonly NavigationItem[];

export const projectInquiryNavigation = {
  label: "Start a Project",
  href: "/start-a-project",
} as const satisfies NavigationItem;

export const ecosystemNavigation = [
  { label: "Labs", href: "/westcose-labs", indicator: "↗" },
  { label: "Shop", href: "/shop", indicator: "↗" },
] as const satisfies readonly NavigationItem[];

export const siteNavigation = [
  ...primaryNavigation,
  projectInquiryNavigation,
  ...ecosystemNavigation,
] as const satisfies readonly NavigationItem[];
