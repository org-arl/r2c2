plugins {
    base
    id("com.github.node-gradle.node") version "2.2.3"
}

tasks {
    "npmInstall" {
        inputs.file(file("package.json"))
    }
    "npm_run_build" {
        dependsOn("npmInstall")
        inputs.file(file("package.json"))
        inputs.dir(file("src"))
        inputs.dir(file("public"))
        outputs.dir(file("build"))
    }
    "build" {
        dependsOn("npm_run_build")
    }
}

tasks {
    "npm_run_buildsim" {
        dependsOn("npmInstall")
        inputs.file(file("package.json"))
        inputs.dir(file("src"))
        inputs.dir(file("public"))
        outputs.dir(file("build"))
    }
}

tasks {
    register("buildsim") {
        dependsOn("npm_run_buildsim")
    }
}

node {
    version = "12.16.1"
    npmVersion = "6.13.4"
    download = true
}
