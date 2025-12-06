package org.kollappbackend;

import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.lang.reflect.Method;
import java.lang.reflect.ParameterizedType;
import java.lang.reflect.Type;
import java.net.URL;
import java.net.URLClassLoader;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import org.apache.maven.plugin.AbstractMojo;
import org.apache.maven.plugin.MojoExecutionException;
import org.apache.maven.plugins.annotations.LifecyclePhase;
import org.apache.maven.plugins.annotations.Mojo;
import org.apache.maven.plugins.annotations.Parameter;
import org.apache.maven.plugins.annotations.ResolutionScope;
import org.apache.maven.project.MavenProject;

import cz.habarta.typescript.generator.DateMapping;
import cz.habarta.typescript.generator.EnumMapping;
import cz.habarta.typescript.generator.Input;
import cz.habarta.typescript.generator.JsonLibrary;
import cz.habarta.typescript.generator.OptionalProperties;
import cz.habarta.typescript.generator.OptionalPropertiesDeclaration;
import cz.habarta.typescript.generator.Settings;
import cz.habarta.typescript.generator.TypeScriptFileType;
import cz.habarta.typescript.generator.TypeScriptGenerator;
import cz.habarta.typescript.generator.TypeScriptOutputKind;
import io.swagger.v3.oas.annotations.Operation;

@Mojo(
    name = "generate-ts-api",
    defaultPhase = LifecyclePhase.PROCESS_CLASSES,
    requiresDependencyResolution = ResolutionScope.COMPILE,
    threadSafe = true
)
public class GenerateTsApiTypesMojo extends AbstractMojo {

    @Parameter(required = true)
    private List<String> classPatterns;

    @Parameter
    private List<String> excludeClasses = new ArrayList<>();

    @Parameter(required = true)
    private File outputFile;

    @Parameter(defaultValue = "${project}", readonly = true, required = true)
    private MavenProject project;

    @Parameter(defaultValue = "${project.build.outputDirectory}", readonly = true)
    private File classesDirectory;

    @Parameter(defaultValue = "jackson2")
    private String jsonLibrary;

    @Parameter
    private List<String> customTypeMappings;

    @Parameter(defaultValue = "asString")
    private String mapDate;

    @Parameter(defaultValue = "asUnion")
    private String mapEnum;

    @Override
    public void execute() throws MojoExecutionException {
        try {
            getLog().info("Generating abstract TypeScript controllers...");
            getLog().info("Class patterns: " + classPatterns);
            getLog().info("Output file: " + outputFile.getAbsolutePath());
            getLog().info("Classes directory: " + classesDirectory.getAbsolutePath());

            Settings tsGeneratorSettings = readTypeScriptGeneratorConfig();

            URLClassLoader classLoader = createProjectClassLoader();

            List<Class<?>> allClasses = findClasses(classLoader);
            getLog().info("Found " + allClasses.size() + " classes matching patterns");

            List<Class<?>> dtoClasses = new ArrayList<>();
            List<Class<?>> controllerClasses = new ArrayList<>();

            for (Class<?> clazz : allClasses) {
                // Skip builder classes
                String className = clazz.getName();
                if (className.endsWith("Builder") || (className.contains("$") && className.endsWith("Builder"))) {
                    continue;
                }
                
                // Skip excluded classes
                if (excludeClasses != null && excludeClasses.contains(className)) {
                    continue;
                }
                
                // Determine if it's a controller (either has @Operation methods OR class name ends with "Controller")
                if (hasOperationAnnotations(clazz) || clazz.getSimpleName().endsWith("Controller")) {
                    controllerClasses.add(clazz);
                } else {
                    dtoClasses.add(clazz);
                }
            }

            getLog().info("Found " + controllerClasses.size() + " controller classes");
            getLog().info("Found " + dtoClasses.size() + " DTO classes");

            if (!dtoClasses.isEmpty()) {
                generateDtoDeclarations(dtoClasses, tsGeneratorSettings);
            } else {
                if (!outputFile.exists()) {
                    outputFile.getParentFile().mkdirs();
                    outputFile.createNewFile();
                }
            }

            if (!controllerClasses.isEmpty()) {
                String abstractControllersTs = generateAbstractControllersTs(controllerClasses);
                appendToOutputFile(abstractControllersTs);
            }

            getLog().info("Successfully generated TypeScript definitions at: " + outputFile.getAbsolutePath());

        } catch (Exception e) {
            throw new MojoExecutionException("Failed to generate abstract TypeScript", e);
        }
    }

    private URLClassLoader createProjectClassLoader() throws Exception {
        List<URL> urls = new ArrayList<>();
        
        urls.add(classesDirectory.toURI().toURL());
        
        for (Object element : project.getCompileClasspathElements()) {
            urls.add(new File((String) element).toURI().toURL());
        }
        
        getLog().debug("Created classloader with " + urls.size() + " URLs");
        return new URLClassLoader(urls.toArray(new URL[0]), getClass().getClassLoader());
    }

    private List<Class<?>> findClasses(URLClassLoader classLoader) throws Exception {
        List<Class<?>> classes = new ArrayList<>();
        
        if (!classesDirectory.exists()) {
            getLog().warn("Classes directory does not exist: " + classesDirectory);
            return classes;
        }

        try (Stream<Path> paths = Files.walk(classesDirectory.toPath())) {
            List<Path> classFiles = paths
                .filter(Files::isRegularFile)
                .filter(p -> p.toString().endsWith(".class"))
                .collect(Collectors.toList());

            for (Path classFile : classFiles) {
                String className = getClassName(classFile);
                
                if (!matchesAnyPattern(className)) {
                    continue;
                }
                
                try {
                    Class<?> clazz = classLoader.loadClass(className);
                    classes.add(clazz);
                } catch (ClassNotFoundException | NoClassDefFoundError e) {
                    getLog().debug("Could not load class: " + className + " - " + e.getMessage());
                }
            }
        }

        return classes;
    }

    private String getClassName(Path classFile) {
        String relativePath = classesDirectory.toPath().relativize(classFile).toString();
        return relativePath
            .replace(File.separatorChar, '.')
            .replaceAll("\\.class$", "");
    }

    private boolean matchesAnyPattern(String className) {
        for (String pattern : classPatterns) {
            if (matchesPattern(className, pattern)) {
                return true;
            }
        }
        return false;
    }

    private boolean matchesPattern(String className, String pattern) {
        String regex = pattern
            .replace(".", "\\.")
            .replace("**", ".*")
            .replace("*", "[^.]*");
        return className.matches(regex);
    }

    private boolean hasOperationAnnotations(Class<?> clazz) {
        for (Method method : clazz.getDeclaredMethods()) {
            if (method.isAnnotationPresent(Operation.class)) {
                return true;
            }
        }
        return false;
    }

    private Settings readTypeScriptGeneratorConfig() {
        Settings settings = new Settings();
        settings.outputFileType = TypeScriptFileType.declarationFile;
        settings.outputKind = TypeScriptOutputKind.module;
        
        // Set jsonLibrary with default
        if (jsonLibrary != null) {
            settings.jsonLibrary = JsonLibrary.valueOf(jsonLibrary);
        } else {
            settings.jsonLibrary = JsonLibrary.jackson2;
        }
        
        // Set mapDate with default
        if (mapDate != null) {
            settings.mapDate = DateMapping.valueOf(mapDate);
        } else {
            settings.mapDate = DateMapping.asString;
        }
        
        // Set mapEnum with default
        if (mapEnum != null) {
            settings.mapEnum = EnumMapping.valueOf(mapEnum);
        } else {
            settings.mapEnum = EnumMapping.asUnion;
        }
        
        // Configure optional properties based on validation annotations
        settings.optionalProperties = OptionalProperties.useSpecifiedAnnotations;
        settings.optionalPropertiesDeclaration = OptionalPropertiesDeclaration.questionMark;
        try {
            settings.requiredAnnotations = java.util.Arrays.asList(
                Class.forName("jakarta.validation.constraints.NotNull").asSubclass(java.lang.annotation.Annotation.class),
                Class.forName("jakarta.validation.constraints.NotBlank").asSubclass(java.lang.annotation.Annotation.class),
                Class.forName("jakarta.validation.constraints.NotEmpty").asSubclass(java.lang.annotation.Annotation.class)
            );
        } catch (ClassNotFoundException e) {
            getLog().warn("Could not load Jakarta validation annotations for optional property detection: " + e.getMessage());
        }
        
        // Add default custom type mappings
        settings.customTypeNaming.put("long", "number");
        settings.customTypeNaming.put("java.lang.Long", "number");
        settings.customTypeNaming.put("java.time.LocalDate", "string");
        
        // Override with user-provided customTypeMappings if any
        if (customTypeMappings != null && !customTypeMappings.isEmpty()) {
            for (String mapping : customTypeMappings) {
                if (mapping != null && mapping.contains(":")) {
                    String[] parts = mapping.split(":", 2);
                    settings.customTypeNaming.put(parts[0], parts[1]);
                }
            }
        }
        
        return settings;
    }

    private void generateDtoDeclarations(List<Class<?>> dtoClasses, Settings settings) throws Exception {
        
        // Ensure output directory exists
        outputFile.getParentFile().mkdirs();
        
        Input input = Input.from(dtoClasses.toArray(new Class<?>[0]));
        
        TypeScriptGenerator generator = new TypeScriptGenerator(settings);
        String output = generator.generateTypeScript(input);
        
        // Write to file
        try (FileWriter writer = new FileWriter(outputFile)) {
            writer.write(output);
        }
    }

    private String generateAbstractControllersTs(List<Class<?>> controllers) {
        StringBuilder sb = new StringBuilder();

        for (Class<?> controller : controllers) {
            String tsClassName = controller.getSimpleName();
            // Rename Controller to Service and prefix with Abstract
            if (tsClassName.endsWith("Controller")) {
                tsClassName = tsClassName.replace("Controller", "Service");
            }
            tsClassName = "Abstract" + tsClassName;
            
            sb.append("\nexport abstract class ").append(tsClassName).append(" {\n");

            for (Method method : controller.getDeclaredMethods()) {
                Operation op = method.getAnnotation(Operation.class);
                if (op != null) {
                    appendMethod(sb, method, op);
                }
            }

            sb.append("}\n\n");
        }

        return sb.toString();
    }

    private void appendMethod(StringBuilder sb, Method method, Operation op) {
        String summary = op.summary();
        if (summary == null || summary.isBlank()) {
            summary = method.getName();
        }

        Type returnType = method.getGenericReturnType();
        String tsReturnType = mapJavaToTsType(returnType);
        String promiseReturn = "Promise<" + tsReturnType + ">";

        java.lang.reflect.Parameter[] params = method.getParameters();

        // JSDoc
        sb.append("    /**\n");
        sb.append("     * ").append(escapeJsDoc(summary)).append("\n");
        for (java.lang.reflect.Parameter p : params) {
            sb.append("     * @param ").append(p.getName()).append("\n");
        }
        sb.append("     * @returns {").append(promiseReturn).append("}\n");
        sb.append("     */\n");

        // Method signature
        sb.append("    abstract ")
          .append(method.getName())
          .append("(");

        for (int i = 0; i < params.length; i++) {
            if (i > 0) sb.append(", ");
            java.lang.reflect.Parameter p = params[i];
            String tsParamType = mapJavaToTsType(p.getParameterizedType());
            sb.append(p.getName()).append(": ").append(tsParamType);
        }

        sb.append("): ").append(promiseReturn).append(";\n\n");
    }

    private String mapJavaToTsType(Type type) {
        if (type == null) {
            return "void";
        }

        String typeName = type.getTypeName();

        // Handle primitives and common types
        if (typeName.equals("void")) return "void";
        if (typeName.equals("java.lang.String")) return "string";
        if (typeName.equals("java.lang.CharSequence")) return "string";
        if (typeName.equals("char") || typeName.equals("java.lang.Character")) return "string";
        
        if (typeName.equals("int") || typeName.equals("java.lang.Integer")) return "number";
        if (typeName.equals("long") || typeName.equals("java.lang.Long")) return "number";
        if (typeName.equals("short") || typeName.equals("java.lang.Short")) return "number";
        if (typeName.equals("byte") || typeName.equals("java.lang.Byte")) return "number";
        if (typeName.equals("float") || typeName.equals("java.lang.Float")) return "number";
        if (typeName.equals("double") || typeName.equals("java.lang.Double")) return "number";
        if (typeName.equals("java.math.BigDecimal")) return "number";
        if (typeName.equals("java.math.BigInteger")) return "number";
        
        if (typeName.equals("boolean") || typeName.equals("java.lang.Boolean")) return "boolean";
        
        // Date/Time types
        if (typeName.equals("java.time.LocalDate")) return "string";
        if (typeName.equals("java.time.LocalDateTime")) return "string";
        if (typeName.equals("java.time.ZonedDateTime")) return "string";
        if (typeName.equals("java.time.Instant")) return "string";
        if (typeName.equals("java.util.Date")) return "string";

        // Handle parameterized types (generics)
        if (type instanceof ParameterizedType) {
            ParameterizedType pType = (ParameterizedType) type;
            Type rawType = pType.getRawType();
            String rawTypeName = rawType.getTypeName();

            Type[] typeArgs = pType.getActualTypeArguments();

            // Handle List, Set, Collection
            if (rawTypeName.equals("java.util.List") || 
                rawTypeName.equals("java.util.Set") ||
                rawTypeName.equals("java.util.Collection")) {
                if (typeArgs.length > 0) {
                    return mapJavaToTsType(typeArgs[0]) + "[]";
                }
                return "any[]";
            }

            // Handle Map
            if (rawTypeName.equals("java.util.Map")) {
                if (typeArgs.length == 2) {
                    String keyType = mapJavaToTsType(typeArgs[0]);
                    String valueType = mapJavaToTsType(typeArgs[1]);
                    return "{ [key: " + keyType + "]: " + valueType + " }";
                }
                return "{ [key: string]: any }";
            }

            // Handle ResponseEntity
            if (rawTypeName.equals("org.springframework.http.ResponseEntity")) {
                if (typeArgs.length > 0) {
                    return mapJavaToTsType(typeArgs[0]);
                }
                return "any";
            }

            // Handle Optional
            if (rawTypeName.equals("java.util.Optional")) {
                if (typeArgs.length > 0) {
                    return mapJavaToTsType(typeArgs[0]) + " | undefined";
                }
                return "any";
            }

            // Handle generic custom classes (like DataResponseTO<T>, etc.)
            // For any other parameterized type, preserve the generics
            if (rawType instanceof Class) {
                Class<?> rawClass = (Class<?>) rawType;
                String simpleName = rawClass.getSimpleName();
                if (!simpleName.isEmpty() && typeArgs.length > 0) {
                    StringBuilder sb = new StringBuilder(simpleName);
                    sb.append("<");
                    for (int i = 0; i < typeArgs.length; i++) {
                        if (i > 0) sb.append(", ");
                        sb.append(mapJavaToTsType(typeArgs[i]));
                    }
                    sb.append(">");
                    return sb.toString();
                }
            }
        }

        // Handle arrays
        if (type instanceof Class && ((Class<?>) type).isArray()) {
            Class<?> componentType = ((Class<?>) type).getComponentType();
            return mapJavaToTsType(componentType) + "[]";
        }

        // For custom classes, use simple name
        if (type instanceof Class) {
            Class<?> clazz = (Class<?>) type;
            String simpleName = clazz.getSimpleName();
            
            // Check if it's a known DTO/model class
            if (!simpleName.isEmpty() && !clazz.isPrimitive()) {
                return simpleName;
            }
        }

        // Fallback
        return "any";
    }

    private String escapeJsDoc(String text) {
        if (text == null) return "";
        return text.replace("*/", "*\\/");
    }

    private void appendToOutputFile(String content) throws IOException {
        try (FileWriter fw = new FileWriter(outputFile, true)) {
            fw.write(content);
        }
    }
}
