// Viewport hooks — expose isMobile/isTablet globally
// Single source of truth for responsive breakpoints.

const BREAKPOINT_MOBILE = 760;
const BREAKPOINT_TABLET = 1080;

function useViewport() {
  const [w, setW] = React.useState(typeof window !== "undefined" ? window.innerWidth : 1440);
  React.useEffect(() => {
    const onResize = () => setW(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return {
    width: w,
    isMobile: w < BREAKPOINT_MOBILE,
    isTablet: w >= BREAKPOINT_MOBILE && w < BREAKPOINT_TABLET,
    isDesktop: w >= BREAKPOINT_TABLET,
  };
}

// Tiny helper to write conditional values inline
function rv(v, mobile, tablet) {
  // rv(desktopValue, mobileValue, tabletValue?)
  if (typeof window === "undefined") return v;
  if (window.innerWidth < BREAKPOINT_MOBILE) return mobile;
  if (window.innerWidth < BREAKPOINT_TABLET && tablet !== undefined) return tablet;
  return v;
}

Object.assign(window, { useViewport, rv, BREAKPOINT_MOBILE, BREAKPOINT_TABLET });
