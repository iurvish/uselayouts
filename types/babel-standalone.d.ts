declare module "@babel/standalone" {
  const Babel: {
    transform: (
      code: string,
      options?: Record<string, unknown>,
    ) => { code?: string };
  };
  export default Babel;
}
