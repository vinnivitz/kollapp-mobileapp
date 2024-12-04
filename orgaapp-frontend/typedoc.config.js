/** @type {Partial<import("typedoc").TypeDocOptions>} */
const config = {
    entryPointStrategy: "expand",
    entryPoints: ["./src/lib/utils"],
    out: "docs",
    excludeNotDocumented: true,
    name: "Kollapp Utils API",
};

export default config;