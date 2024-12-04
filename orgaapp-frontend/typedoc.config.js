/** @type {Partial<import("typedoc").TypeDocOptions>} */
const config = {
    entryPointStrategy: "expand",
    entryPoints: ["./src/lib"],
    out: "docs",
};

export default config;