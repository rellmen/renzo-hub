// Type declaration only. The original seven Lovable JPEG binary files must be
// imported separately before Vite can build; this is NOT an asset replacement.
declare module "*.jpg" {
  const url: string;
  export default url;
}
