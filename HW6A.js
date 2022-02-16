"use strict";

var plusSign = function() {
    var canvas;
    var gl;

    var axis = 0;
    var xAxis = 0;
    var yAxis = 1;
    // no rotation on zAxis, so it's not included.

    var theta = [0, 0, 0];
    var thetaLoc;

    var usingArrows = false;
    var rotDirection = 0;

    var numElements = 180;
    /* Explaining numElements:
    A cube has 6 faces.
    Each face is made up of 2 triangles.
    Each triangle has 3 points.
    6 * 2 * 3 = 36 elements for a cube.
    The plus sign object is made up of 5 cubes,
    so 36 * 5 = 180 elements for the plus sign. */

    var texSize = 64;

    const eye = vec3(0.0, 0.0, 1.5);
    const at = vec3(0.0, 0.0, 0.0);
    const up = vec3(0.0, 1.0, 0.0);
    var modelViewMatrix, modelViewMatrixLoc;

    var  fovy = 120.0; // field-of-view in Y direction angle (in degrees)
    var  aspect = 1.0; // viewport aspect ratio
    var near = 0.3; // distance from camera, before front of object
    var far = 3; // distance from camera, after back of object
    var projectionMatrix, projectionMatrixLoc;

    var normalsArray = [];
    var texCoordsArray = [];

    var texture;

    var texCoord = [
        vec2(0, 0),
        vec2(0, 1),
        vec2(1, 1),
        vec2(1, 0)
    ];

    // local homogenous coordinates for vertices
    var localVerts = [
        // top of plus sign
        vec4(4.5, 7.5, 7.5, 1),
        vec4(4.5, 9, 7.5, 1),
        vec4(7.5, 9, 7.5, 1),
        vec4(7.5, 7.5, 7.5, 1),
        vec4(4.5, 7.5, 4.5, 1),
        vec4(4.5, 9, 4.5, 1),
        vec4(7.5, 9, 4.5, 1),
        vec4(7.5, 7.5, 4.5, 1),

        // left of plus sign
        vec4(3, 4.5, 7.5, 1),
        vec4(3, 7.5, 7.5, 1),
        vec4(4.5, 7.5, 7.5, 1),
        vec4(4.5, 4.5, 7.5, 1),
        vec4(3, 4.5, 4.5, 1),
        vec4(3, 7.5, 4.5, 1),
        vec4(4.5, 7.5, 4.5, 1),
        vec4(4.5, 4.5, 4.5, 1),

        // middle of plus sign
        vec4(4.5, 4.5, 7.5, 1),
        vec4(4.5, 7.5, 7.5, 1),
        vec4(7.5, 7.5, 7.5, 1),
        vec4(7.5, 4.5, 7.5, 1),
        vec4(4.5, 4.5, 4.5, 1),
        vec4(4.5, 7.5, 4.5, 1),
        vec4(7.5, 7.5, 4.5, 1),
        vec4(7.5, 4.5, 4.5, 1),

        // right of plus sign
        vec4(7.5, 4.5, 7.5, 1),
        vec4(7.5, 7.5, 7.5, 1),
        vec4(9, 7.5, 7.5, 1),
        vec4(9, 4.5, 7.5, 1),
        vec4(7.5, 4.5, 4.5, 1),
        vec4(7.5, 7.5, 4.5, 1),
        vec4(9, 7.5, 4.5, 1),
        vec4(9, 4.5, 4.5, 1),

        // bottom of plus sign
        vec4(4.5, 3, 7.5, 1),
        vec4(4.5, 4.5, 7.5, 1),
        vec4(7.5, 4.5, 7.5, 1),
        vec4(7.5, 3, 7.5, 1),
        vec4(4.5, 3, 4.5, 1),
        vec4(4.5, 4.5, 4.5, 1),
        vec4(7.5, 4.5, 4.5, 1),
        vec4(7.5, 3, 4.5, 1)
    ];

    var scaleMatrix = mat4(1/3, 0, 0, 0,
                            0, 1/3, 0, 0,
                            0, 0, 1/3, 0,
                            0, 0, 0, 1);

    var translateMatrix = mat4(1, 0, 0, -2,
                                0, 1, 0, -2,
                                0, 0, 1, -2,
                                0, 0, 0, 1);

    // to store result from converting to default view volume
    var vertices = [];

    /* TESTING: color with light off ... REMOVETHIS? */
    var vertexColors = [
        vec4(0.0, 0.0, 0.0, 1.0),  // black
        vec4(1.0, 0.0, 0.0, 1.0),  // red
        vec4(1.0, 1.0, 0.0, 1.0),  // yellow
        vec4(0.0, 1.0, 0.0, 1.0),  // green
        vec4(0.0, 0.0, 1.0, 1.0),  // blue
        vec4(1.0, 0.0, 1.0, 1.0),  // magenta
        vec4(1.0, 1.0, 1.0, 1.0),  // white
        vec4(0.0, 1.0, 1.0, 1.0),   // cyan

        vec4(0.0, 0.0, 0.0, 1.0),  // black
        vec4(1.0, 0.0, 0.0, 1.0),  // red
        vec4(1.0, 1.0, 0.0, 1.0),  // yellow
        vec4(0.0, 1.0, 0.0, 1.0),  // green
        vec4(0.0, 0.0, 1.0, 1.0),  // blue
        vec4(1.0, 0.0, 1.0, 1.0),  // magenta
        vec4(1.0, 1.0, 1.0, 1.0),  // white
        vec4(0.0, 1.0, 1.0, 1.0),   // cyan

        vec4(0.0, 0.0, 0.0, 1.0),  // black
        vec4(1.0, 0.0, 0.0, 1.0),  // red
        vec4(1.0, 1.0, 0.0, 1.0),  // yellow
        vec4(0.0, 1.0, 0.0, 1.0),  // green
        vec4(0.0, 0.0, 1.0, 1.0),  // blue
        vec4(1.0, 0.0, 1.0, 1.0),  // magenta
        vec4(1.0, 1.0, 1.0, 1.0),  // white
        vec4(0.0, 1.0, 1.0, 1.0),   // cyan

        vec4(0.0, 0.0, 0.0, 1.0),  // black
        vec4(1.0, 0.0, 0.0, 1.0),  // red
        vec4(1.0, 1.0, 0.0, 1.0),  // yellow
        vec4(0.0, 1.0, 0.0, 1.0),  // green
        vec4(0.0, 0.0, 1.0, 1.0),  // blue
        vec4(1.0, 0.0, 1.0, 1.0),  // magenta
        vec4(1.0, 1.0, 1.0, 1.0),  // white
        vec4(0.0, 1.0, 1.0, 1.0),   // cyan

        vec4(0.0, 0.0, 0.0, 1.0),  // black
        vec4(1.0, 0.0, 0.0, 1.0),  // red
        vec4(1.0, 1.0, 0.0, 1.0),  // yellow
        vec4(0.0, 1.0, 0.0, 1.0),  // green
        vec4(0.0, 0.0, 1.0, 1.0),  // blue
        vec4(1.0, 0.0, 1.0, 1.0),  // magenta
        vec4(1.0, 1.0, 1.0, 1.0),  // white
        vec4(0.0, 1.0, 1.0, 1.0)   // cyan
    ];

    // indices of 12 triangles per cube inside the plus sign
    var indices = [
        1, 0, 3,
        3, 2, 1,
        2, 3, 7,
        7, 6, 2,
        3, 0, 4,
        4, 7, 3,
        6, 5, 1,
        1, 2, 6,
        4, 5, 6,
        6, 7, 4,
        5, 4, 0,
        0, 1, 5,

        9, 8, 11,
        11, 10, 9,
        10, 11, 15,
        15, 14, 10,
        11, 8, 12,
        12, 15, 11,
        14, 13, 9,
        9, 10, 14,
        12, 13, 14,
        14, 15, 12,
        13, 12, 8,
        8, 9, 13,

        17, 16, 19,
        19, 18, 17,
        18, 19, 23,
        23, 22, 18,
        19, 16, 20,
        20, 23, 19,
        22, 21, 17,
        17, 18, 22,
        20, 21, 22,
        22, 23, 20,
        21, 20, 16,
        16, 17, 21,

        25, 24, 27,
        27, 26, 25,
        26, 27, 31,
        31, 30, 26,
        27, 24, 28,
        28, 31, 27,
        30, 29, 25,
        25, 26, 30,
        28, 29, 30,
        30, 31, 28,
        29, 28, 24,
        24, 25, 29,

        33, 32, 35,
        35, 34, 33,
        34, 35, 39,
        39, 38, 34,
        35, 32, 36,
        36, 39, 35,
        38, 37, 33,
        33, 34, 38,
        36, 37, 38,
        38, 39, 36,
        37, 36, 32,
        32, 33, 37
    ];

    var lightPosition = vec4(1.0, 1.0, 1.0, 0.0);
    var lightAmbient = vec4(0.8, 0.0, 0.0, 1.0);
    var lightDiffuse = vec4(1.0, 1.0, 1.0, 1.0);
    var lightSpecular = vec4(1.0, 1.0, 1.0, 1.0);

    var materialAmbient = vec4(1.0, 0.0, 0.0, 1.0);
    var materialDiffuse = vec4(1.0, 0.8, 0.0, 1.0);
    var materialSpecular = vec4(1.0, 0.8, 0.0, 1.0);
    var materialShininess = 80.0;

    var program;

    function configureTexture( image ) {
        texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB,
            gl.RGB, gl.UNSIGNED_BYTE, image);
        gl.generateMipmap(gl.TEXTURE_2D);

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER,
            gl.NEAREST_MIPMAP_LINEAR);

        /*
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER,
            gl.LINEAR);

         */
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

        gl.uniform1i(gl.getUniformLocation(program, "uTexMap"), 0);
    }

    function initNormalsAndTex(a, b, c) {

        var t1 = subtract(vertices[b], vertices[a]);
        var t2 = subtract(vertices[c], vertices[b]);
        var normal = cross(t1, t2);
        normal = vec3(normal);

        /*
        One face of a cube has 2 triangles so 6 vertices.
        One normal per vertex.
        One texture per vertex.
         */
        normalsArray.push(normal);
        normalsArray.push(normal);
        normalsArray.push(normal);
        normalsArray.push(normal);
        normalsArray.push(normal);
        normalsArray.push(normal);

        texCoordsArray.push(texCoord[0]);
        texCoordsArray.push(texCoord[1]);
        texCoordsArray.push(texCoord[2]);
        texCoordsArray.push(texCoord[0]);
        texCoordsArray.push(texCoord[2]);
        texCoordsArray.push(texCoord[3]);
    }

    function facesToNormals()
    {
        /*
        Each cube in the plus sign has 6 faces, so 6 calls to initNormalsAndTex per cube.

        We only need 2 lines to get the normal to that face.
        2 lines means we send over 3 points (the corner is the same).
        The 3 points we send are always for left&bottom line when looking at the face.

        Order of args matters.
        Go counterclockwise when sending params so that it's outward-facing.
         */

        // top of plus sign
        initNormalsAndTex(1, 0, 3); // front
        initNormalsAndTex(2, 3, 7); // right
        initNormalsAndTex(6, 7, 4); // back
        initNormalsAndTex(5, 4, 0); // left
        initNormalsAndTex(5, 1, 2); // top
        initNormalsAndTex(7, 3, 0); // bottom

        // left of plus sign
        initNormalsAndTex(9, 8, 11); // front
        initNormalsAndTex(10, 11, 15); // right
        initNormalsAndTex(14, 15, 12); // back
        initNormalsAndTex(13, 12, 8); // left
        initNormalsAndTex(13, 9, 10); // top
        initNormalsAndTex(15, 11, 8); // bottom

        // middle of plus sign
        initNormalsAndTex(17, 16, 19); // front
        initNormalsAndTex(18, 19, 23); // right
        initNormalsAndTex(22, 23, 20); // back
        initNormalsAndTex(21, 20, 16); // left
        initNormalsAndTex(21, 17, 18); // top
        initNormalsAndTex(23, 19, 16); // bottom

        // right of plus sign
        initNormalsAndTex(25, 24, 27); // front
        initNormalsAndTex(26, 27, 31); // right
        initNormalsAndTex(30, 31, 28); // back
        initNormalsAndTex(29, 28, 24); // left
        initNormalsAndTex(29, 25, 26); // top
        initNormalsAndTex(31, 27, 24); // bottom

        // bottom of plus sign
        initNormalsAndTex(33, 32, 35); // front
        initNormalsAndTex(34, 35, 39); // right
        initNormalsAndTex(38, 39, 36); // back
        initNormalsAndTex(37, 36, 32); // left
        initNormalsAndTex(37, 33, 34); // top
        initNormalsAndTex(39, 35, 32); // bottom
    }

    window.onload = function init() {
        canvas = document.getElementById("gl-canvas");

        gl = canvas.getContext('webgl2');
        if (!gl) alert("WebGL 2.0 isn't available");

        gl.viewport(0, 0, canvas.width, canvas.height);
        aspect =  canvas.width/canvas.height;

        gl.clearColor(0.0, 0.0, 0.0, 1.0);

        gl.enable(gl.DEPTH_TEST);

        //  Load shaders and initialize attribute buffers
        program = initShaders(gl, "vertex-shader", "fragment-shader");
        gl.useProgram(program);

        // convert local coords to eye coords
        for (let i = 0; i < localVerts.length; i++) {
            var newVert = mult(translateMatrix, mult(scaleMatrix, localVerts[i]));
            vertices.push(newVert);
        }

        facesToNormals();
        var nBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW);
        var normalLoc = gl.getAttribLocation(program, "aNormal");
        gl.vertexAttribPointer(normalLoc, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(normalLoc);

        // array element buffer
        var iBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint8Array(indices), gl.STATIC_DRAW);

        /* TESTING: color with light off ... REMOVETHIS? */
        // color array attribute buffer
        var cBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(vertexColors), gl.STATIC_DRAW);
        var colorLoc = gl.getAttribLocation(program, "aColor");
        gl.vertexAttribPointer(colorLoc, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(colorLoc);

        // vertex array attribute buffer
        var vBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);
        var positionLoc = gl.getAttribLocation(program, "aPosition");
        gl.vertexAttribPointer(positionLoc, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(positionLoc);

        var tBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, tBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(texCoordsArray), gl.STATIC_DRAW);
        var texCoordLoc = gl.getAttribLocation(program, "aTexCoord");
        gl.vertexAttribPointer(texCoordLoc, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(texCoordLoc);
        var image = document.getElementById("texImage");
        configureTexture(image);

        thetaLoc = gl.getUniformLocation(program, "uTheta");

        modelViewMatrixLoc = gl.getUniformLocation(program, "uModelViewMatrix");

        var ambientProduct = mult(lightAmbient, materialAmbient);
        var diffuseProduct = mult(lightDiffuse, materialDiffuse);
        var specularProduct = mult(lightSpecular, materialSpecular);

        gl.uniform4fv(gl.getUniformLocation(program, "uAmbientProduct"),
            ambientProduct);
        gl.uniform4fv(gl.getUniformLocation(program, "uDiffuseProduct"),
            diffuseProduct );
        gl.uniform4fv(gl.getUniformLocation(program, "uSpecularProduct"),
            specularProduct );
        gl.uniform4fv(gl.getUniformLocation(program, "uLightPosition"),
            lightPosition );

        gl.uniform1f(gl.getUniformLocation(program,
            "uShininess"), materialShininess);

        projectionMatrixLoc = gl.getUniformLocation(program, "uProjectionMatrix");

        render();
    }

    function render() {
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        // Rotation
        if (usingArrows) {
            theta[axis] += (rotDirection * 10.0);
        }
        gl.uniform3fv(thetaLoc, theta);

        modelViewMatrix = lookAt(eye, at, up);
        gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));

        // Perspective viewing
        projectionMatrix = perspective(fovy, aspect, near, far);
        gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));

        gl.drawElements(gl.TRIANGLES, numElements, gl.UNSIGNED_BYTE, 0);
        // reinitialize
        usingArrows = false;
        requestAnimationFrame(render);
    }

    document.addEventListener('keydown', keyDownHandler, false);

    function keyDownHandler(event) {
        usingArrows = true;
        var keyCode = event.keyCode;
        switch (keyCode) {
            case 38:
                // UP ARROW
                axis = xAxis;
                rotDirection = 1;
                break;
            case 40:
                // DOWN ARROW
                axis = xAxis;
                rotDirection = -1;
                break;
            case 37:
                // LEFT ARROW
                axis = yAxis;
                rotDirection = 1;
                break;
            case 39:
                // RIGHT ARROW
                axis = yAxis;
                rotDirection = -1;
                break;
            default:
        }
        render();
    }
}

plusSign();
