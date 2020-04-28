// Directional lighting demo: By Frederick Li
// Vertex shader program
var VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' +
  'attribute vec4 a_Color;\n' +
  'attribute vec4 a_Normal;\n' +
  'attribute vec2 a_TexCoords;\n' +

  'uniform mat4 u_MvpMatrix;\n' +
  //'uniform vec3 u_lightWorldPosition;' +
  'uniform mat4 u_ModelMatrix;\n' +
  'uniform mat4 u_ViewMatrix;\n' +
  'uniform mat4 u_NormalMatrix;\n' +

  'varying vec3 v_Position;\n' +
  'varying vec3 v_Normal;\n' +
  'varying vec4 v_Color;\n' +
  'varying vec2 v_TexCoords;\n' +

  'void main() {\n' +
  '  gl_Position = u_MvpMatrix * u_ViewMatrix * u_ModelMatrix * a_Position;\n' +
  '  v_Position = vec3(u_ModelMatrix * a_Position);\n' +
  '  v_Normal = normalize(vec3(u_NormalMatrix * a_Normal));\n' +
  '  v_Color = a_Color;\n' +
  '  v_TexCoords = a_TexCoords;\n' +
  '}\n';

  


// Fragment shader program
var FSHADER_SOURCE =
  '#ifdef GL_ES\n' +
  'precision mediump float;\n' +
  '#endif\n' +
  'uniform bool u_isTexture;\n' +
  'uniform vec3 u_LightColor;\n' +
  'uniform vec3 u_LightPosition;\n' +
  //'uniform vec3 u_AmbientLight;\n' +
  'varying vec3 v_Normal;\n' +
  'varying vec3 v_Position;\n' +
  'varying vec4 v_Color;\n' +

  ///////////////////u_texture
  'uniform sampler2D u_Sampler;\n' +
  'varying vec2 v_TexCoords;\n' +

  'void main() {\n' +
  '  vec3 normal = normalize(v_Normal);\n' +
  '  vec3 lightDirection = normalize(u_LightPosition - v_Position);\n' +
  '  float nDotL = max(dot(lightDirection, normal),0.0);\n' +
  '  vec3 diffuse;\n' +
  '  if(u_isTexture)\n' + 
  '  {\n' +
  '     vec4 TexColor = texture2D(u_Sampler, v_TexCoords);\n' +
  '     diffuse = u_LightColor * TexColor.rgb * nDotL * 1.2;\n' + '}\n' +
  '  else\n' +
  '  {\n' +
  '     diffuse = u_LightColor * v_Color.rgb * nDotL;\n' +
  '  }\n' +
  //'  vec3 ambient = u_AmbientLight * v_Color.rgb;\n' +
  '  gl_FragColor = vec4(diffuse, v_Color.a);\n' +
  '}\n';

var modelMatrix = new Matrix4(); // The model matrix
var viewMatrix = new Matrix4();  // The view matrix
var projMatrix = new Matrix4();  // The projection matrix
var g_normalMatrix = new Matrix4();  // Coordinate transformation matrix for normals

var ANGLE_STEP = 3.0;  // The increments of rotation angle (degrees)
var g_xAngle = 0.0;    // The rotation x angle (degrees)
var g_yAngle = 0.0;    // The rotation y angle (degrees)
var R_L_l = 0;
var U_D_l = 20;
var C_F_l = 30;
var X_e = 0;
var Y_e = 0;
var Z_e = 0;
var X = 0;
var Y = 1;
var Z = 0;
var Q = 0;
var angle_lamb = 0;

function main() {
  // Retrieve <canvas> element
  var canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  var gl = getWebGLContext(canvas);
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // Set clear color and enable hidden surface removal
  gl.clearColor(1.0, 1.0, 1.0, 1.0);
  gl.enable(gl.DEPTH_TEST);

  // Clear color and depth buffer
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // Get the storage locations of uniform attributes
  var u_MvpMatrix = gl.getUniformLocation(gl.program, 'u_MvpMatrix');
  var u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  var u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
  var u_NormalMatrix = gl.getUniformLocation(gl.program, 'u_NormalMatrix');
  var u_LightColor = gl.getUniformLocation(gl.program, 'u_LightColor');
  var u_LightPosition = gl.getUniformLocation(gl.program, 'u_LightPosition');
  //var u_AmbientLight = gl.getUniformLocation(gl.program, 'u_AmbientLight');

  // Trigger using lighting or not
  var u_isTexture = gl.getUniformLocation(gl.program, 'u_isTexture'); 



  //mapping
  var u_Sampler = gl.getUniformLocation(gl.program, "u_Sampler");



  if (!u_MvpMatrix || !u_ModelMatrix || !u_NormalMatrix ||
      !u_LightPosition || !u_LightColor ||
      !u_isTexture ) { 
    console.log('Failed to Get the storage locations of u_ModelMatrix, u_ViewMatrix, and/or u_ProjMatrix');
    return;
  }

  // Set the light color (white)

  document.onkeydown = function(ev){
    //alert(ev.keyCode);
    switch (ev.keyCode) {
      //moving the vertural camera
      case 87: // key 'W'
        C_F_l = C_F_l - 1;
          //U_D_l = U_D_l - 1;
          Z_e = Z_e - 1;
          break;
      case 83: // key 'S'
          C_F_l = C_F_l + 1;
          //U_D_l = U_D_l + 1;
          Z_e = Z_e + 1
          break;
      case 65: // key 'A'
          R_L_l = R_L_l - 1;
          X_e = X_e - 1;
          break;
      case 68: // key 'D'
          R_L_l = R_L_l + 1;
          X_e = X_e + 1;
          break;
        case 189: // key '-' 
          U_D_l = U_D_l - 1;
          Y_e = Y_e - 1;
          break;
        case 187: //key '+'
          U_D_l = U_D_l + 1;
          Y_e = Y_e + 1;
          break;
        case 89: // key 'Y'
          Y_e = (Y_e + 1) % 360;
          break;
        case 72: // key 'H'
          Y_e = (Y_e - 1) % 360;
          break;
        case 71: // key 'G'
          X_e = (X_e - 1) % 360;
          break;
        case 74: // key 'J'
          X_e = (X_e + 1) % 360;
          break;
      case 75: // key 'K'
        Z_e = Z_e - 1;
        break;
      case 76: // key 'L'
        Z_e = Z_e + 1;
        break;
      case 32: // key 'BLANK'
        Y = Y * (-1);
        break;
      case 70:
        Q = Q + 1;
        break;
        case 40: // Up arrow key -> the positive rotation of arm1 around the y-axis
          g_xAngle = (g_xAngle + ANGLE_STEP) % 360;
          break;
      case 38: // Down arrow key -> the negative rotation of arm1 around the y-axis
          g_xAngle = (g_xAngle - ANGLE_STEP) % 360;
          break;
      case 39: // Right arrow key -> the positive rotation of arm1 around the y-axis
          g_yAngle = (g_yAngle + ANGLE_STEP) % 360;
          break;
      case 37: // Left arrow key -> the negative rotation of arm1 around the y-axis
          g_yAngle = (g_yAngle - ANGLE_STEP) % 360;
          break;
      default: return; // Skip drawing at no effective action
    }
    //keydown(ev, gl, u_ModelMatrix, u_NormalMatrix, u_isLighting);
    //alert(R_L);

    gl.uniform3f(u_LightColor, 1.0, 1.0, 1.0);
    // Set the light direction (in the world coordinate)
    gl.uniform3fv(u_LightPosition, [angle_lamb / 7, 4.0, -angle_lamb / 7]);
    
    //viewMatrix.lookAt(0, 0, 0);
    viewMatrix.setLookAt(R_L_l, U_D_l, C_F_l, X_e, Y_e, Z_e, X, Y, Z);
    //(close/far, , )
    projMatrix.setPerspective(40, canvas.width/canvas.height, 1, 100);
    // Pass the model, view, and projection matrix to the uniform variable respectively
    gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);
    gl.uniformMatrix4fv(u_MvpMatrix, false, projMatrix.elements);

    draw1(gl, u_ModelMatrix, u_NormalMatrix, u_isTexture, u_Sampler);
    
  }

  var plus = 0.3;
  //while(angle_lamb < 45 && angle_lamb > -45) 
  function draw() {
    angle_lamb += plus;
    shaking_light(gl, u_MvpMatrix, u_ModelMatrix, u_ViewMatrix, u_NormalMatrix, u_LightColor, u_LightPosition, u_isTexture, u_Sampler, canvas);
    requestAnimationFrame(draw);

    //sleep(4);
    if (angle_lamb > 45) {
      plus = -plus;
    }
    if (angle_lamb < -45) {
      plus = -plus;
    }
    angle_lamb += plus;
  }
  draw();
}

function sleep(numberMillis) {
    var now = new Date();
    var exitTime = now.getTime() + numberMillis;
    while (true) {
        now = new Date();
        if (now.getTime() > exitTime)
            return;
    }
}

function shaking_light (gl, u_MvpMatrix, u_ModelMatrix, u_ViewMatrix, u_NormalMatrix, u_LightColor, u_LightPosition, u_isTexture, u_Sampler, canvas) {
  gl.uniform3f(u_LightColor, 1.0, 1.0, 1.0);
  // Set the light direction (in the world coordinate)
  gl.uniform3fv(u_LightPosition, [angle_lamb / 7, 4.0, -angle_lamb / 7]);

  // Calculate the view matrix and the projection matrix
  //the eye's location
  //Xeye(right/left move), Yeye(up/down move), Zeye(close~far move);
  //the lookAt location
  //Xat(left/right move), Yat(down/up move), Zat;
  //DIRx(front spin), DIRy(+up side -down), DIRz)

  //viewMatrix.setLookAt(0, 30, 10, 0, 0, 0, 0, 1, 0);
  //viewMatrix.setLookAt(0, 20, 50, 0, 1, 0, 0, 1, 0);
  viewMatrix.setLookAt(R_L_l, U_D_l, C_F_l, X_e, Y_e, Z_e, X, Y, Z);
  //(close/far, , )
  projMatrix.setPerspective(40, canvas.width/canvas.height, 1, 100);
  // Pass the model, view, and projection matrix to the uniform variable respectively
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);
  gl.uniformMatrix4fv(u_MvpMatrix, false, projMatrix.elements);

  draw1(gl, u_ModelMatrix, u_NormalMatrix, u_isTexture, u_Sampler);
}



function initVertexBuffers1(gl, new_vertices, colors) {
  // Create a cube
  //    v6----- v5
  //   /|      /|
  //  v1------v0|
  //  | |     | |
  //  | |v7---|-|v4
  //  |/      |/
  //  v2------v3
  var vertices = new Float32Array([   // Coordinates(x,y,z)
     0.5, 0.5, 0.5,  -0.5, 0.5, 0.5,  -0.5,-0.5, 0.5,   0.5,-0.5, 0.5, // v0-v1-v2-v3 front
     0.5, 0.5, 0.5,   0.5,-0.5, 0.5,   0.5,-0.5,-0.5,   0.5, 0.5,-0.5, // v0-v3-v4-v5 right
     0.5, 0.5, 0.5,   0.5, 0.5,-0.5,  -0.5, 0.5,-0.5,  -0.5, 0.5, 0.5, // v0-v5-v6-v1 up
    -0.5, 0.5, 0.5,  -0.5, 0.5,-0.5,  -0.5,-0.5,-0.5,  -0.5,-0.5, 0.5, // v1-v6-v7-v2 left
    -0.5,-0.5,-0.5,   0.5,-0.5,-0.5,   0.5,-0.5, 0.5,  -0.5,-0.5, 0.5, // v7-v4-v3-v2 down
     0.5,-0.5,-0.5,  -0.5,-0.5,-0.5,  -0.5, 0.5,-0.5,   0.5, 0.5,-0.5  // v4-v7-v6-v5 back
  ]);


  var normals = new Float32Array([    // Normal
    0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,  // v0-v1-v2-v3 front
    1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,  // v0-v3-v4-v5 right
    1.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,  // v0-v5-v6-v1 up
   -1.0, 1.0, 0.0,  -1.0, 1.0, 0.0,  -1.0, 1.0, 0.0,  -1.0, 1.0, 0.0,  // v1-v6-v7-v2 left
    0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,  // v7-v4-v3-v2 down
    0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0   // v4-v7-v6-v5 back
  ]);


  // Indices of the vertices
  var indices = new Uint8Array([
     0, 1, 2,   0, 2, 3,    // front
     4, 5, 6,   4, 6, 7,    // right
     8, 9,10,   8,10,11,    // up
    12,13,14,  12,14,15,    // left
    16,17,18,  16,18,19,    // down
    20,21,22,  20,22,23     // back
 ]);


  // Write the vertex property to buffers (coordinates, colors and normals)
  if(new_vertices){
    if (!initArrayBuffer1(gl, 'a_Position', new_vertices, 3, gl.FLOAT)) return -1;
  }
  else{
    if (!initArrayBuffer1(gl, 'a_Position', vertices, 3, gl.FLOAT)) return -1;
  }
  if(colors){
    if (!initArrayBuffer1(gl, 'a_Color', colors, 3, gl.FLOAT)) return -1;
  }
  if (!initArrayBuffer1(gl, 'a_Normal', normals, 3, gl.FLOAT)) return -1;



  var textureBuffer = gl.createBuffer();
  if (!textureBuffer) {
    console.log('Failed to create the texture object');
    return false;
  }



  // Write the indices to the buffer object
  var indexBuffer = gl.createBuffer();
  if (!indexBuffer) {
    console.log('Failed to create the buffer object');
    return false;
  }

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);


  return indices.length;
}

function initArrayBuffer1 (gl, attribute, data, num, type) {
  // Create a buffer object
  var buffer = gl.createBuffer();
  if (!buffer) {
    console.log('Failed to create the buffer object');
    return false;
  }
  // Write date into the buffer object
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
  // Assign the buffer object to the attribute variable
  var a_attribute = gl.getAttribLocation(gl.program, attribute);
  if (a_attribute < 0) {
    console.log('Failed to get the storage location of ' + attribute);
    return false;
  }
  gl.vertexAttribPointer(a_attribute, num, type, false, 0, 0);
  // Enable the assignment of the buffer object to the attribute variable
  gl.enableVertexAttribArray(a_attribute);

  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  return true;
}

function initAxesVertexBuffers1(gl) {

  var verticesColors = new Float32Array([
    // Vertex coordinates and color (for axes) line
    -20.0,  0.0,   0.0,  1.0,  1.0,  1.0,  // (x,y,z), (r,g,b) 
     20.0,  0.0,   0.0,  1.0,  1.0,  1.0,
     0.0,  20.0,   0.0,  1.0,  1.0,  1.0, 
     0.0, -20.0,   0.0,  1.0,  1.0,  1.0,
     0.0,   0.0, -20.0,  1.0,  1.0,  1.0, 
     0.0,   0.0,  20.0,  1.0,  1.0,  1.0 
  ]);
  var n = 6;

  // Create a buffer object
  var vertexColorBuffer = gl.createBuffer();  
  if (!vertexColorBuffer) {
    console.log('Failed to create the buffer object');
    return false;
  }

  // Bind the buffer object to target
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, verticesColors, gl.STATIC_DRAW);

  var FSIZE = verticesColors.BYTES_PER_ELEMENT;
  //Get the storage location of a_Position, assign and enable buffer
  var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return -1;
  }
  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, FSIZE * 6, 0);
  gl.enableVertexAttribArray(a_Position);  // Enable the assignment of the buffer object

  // Get the storage location of a_Position, assign buffer and enable
  var a_Color = gl.getAttribLocation(gl.program, 'a_Color');
  if(a_Color < 0) {
    console.log('Failed to get the storage location of a_Color');
    return -1;
  }
  gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, FSIZE * 6, FSIZE * 3);
  gl.enableVertexAttribArray(a_Color);  // Enable the assignment of the buffer object

  // Unbind the buffer object
  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  return n;
}

function drawTexture(gl, n, u_Sampler) {
  cubeTexture = gl.createTexture();
  if(! cubeTexture) {
    console.log('Failed to careate the texture');
    return -1;
  }
  var image = new Image();
  image.crossOrigin = "anonymous";
  if (!image) {
    console.log('Fail to load the image');
    return -1;
  }
  image.src = "floor.jpg";
  image.onload = function() { handleTextureLoaded(gl, cubeImage, cubeTexture); }
  
  //image.src = "floor.jpg";


  function handleTextureLoaded(gl, image, texture) {
    gl.piexlStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
    gl.activeTexture(gl.TEXTURE);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    //gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
      gl.generateMipmap(gl.TEXTURE_2D);
    } 
    else 
    {
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    }
    gl.bindTexture(gl.TEXTURE_2D, null);
  }

  gl.uniform1i(u_Sampler, 0);
  return;
}


var g_matrixStack = []; // Array for storing a matrix
function PushMatrix1(m) { // Store the specified matrix to the array
  var m2 = new Matrix4(m);
  g_matrixStack.push(m2);
}

function popMatrix1() { // Retrieve the matrix from the array
  return g_matrixStack.pop();
}

function draw1(gl, u_ModelMatrix, u_NormalMatrix, u_isTexture, u_Sampler) {

  // Clear color and depth buffer
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  

  gl.uniform1i(u_isTexture, false); // Will not apply lighting

  // Set the vertex coordinates and color (for the x, y axes)

  var n = initAxesVertexBuffers1(gl);
  if (n < 0) {
    console.log('Failed to set the vertex information');
    return;
  }

  // Calculate the view matrix and the projection matrix
  modelMatrix.setTranslate(0, 0, 0);  // No Translation
  // Pass the model matrix to the uniform variable
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);

  // Draw x and y axes
  gl.drawArrays(gl.LINES, 0, n);

  gl.uniform1i(u_isTexture, false); // Will apply lighting

  var colors = new Float32Array([    // Colors
    1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0,     // v0-v1-v2-v3 front
    1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0,     // v0-v3-v4-v5 right
    1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0,     // v0-v5-v6-v1 up
    1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0,     // v1-v6-v7-v2 left
    1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0,     // v7-v4-v3-v2 down
    1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0　    // v4-v7-v6-v5 back
  ]);
  // Set the vertex coordinates and color (for the cube)
  var n = initVertexBuffers1(gl, false, colors);
  if (n < 0) {
    console.log('Failed to set the vertex information');
    return;
  }

  // Rotate, and then translate
  modelMatrix.setTranslate(5, 0, 0);  // Translation (No translation is supported here)
  modelMatrix.rotate(-90, 0, 1, 0); // Rotate along y axis
  modelMatrix.rotate(g_xAngle, 1, 0, 0); // Rotate along x axis

  // Model the chair seat
  PushMatrix1(modelMatrix);
    modelMatrix.scale(2.0, 0.5, 2.0); // Scale
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix1();

  // Model the chair back
  PushMatrix1(modelMatrix);
    modelMatrix.translate(0, 1.25, -0.75);  // Translation
    modelMatrix.scale(2.0, 2.0, 0.5); // Scale
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix1();

  // Model the chair back-right leg
  PushMatrix1(modelMatrix);
    modelMatrix.translate(0.75, -1.05, -0.75);  // Translation
    modelMatrix.scale(0.5, 1.6, 0.5); // Scale
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix1();

  // Model the chair back-left leg
  PushMatrix1(modelMatrix);
    modelMatrix.translate(-0.75, -1.05, -0.75);  // Translation
    modelMatrix.scale(0.5, 1.6, 0.5); // Scale
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix1();

  // Model the chair front-right leg
  PushMatrix1(modelMatrix);
    modelMatrix.translate(0.75, -1.05, 0.75);  // Translation
    modelMatrix.scale(0.5, 1.6, 0.5); // Scale
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix1();

  // Model the chair front-left leg
  PushMatrix1(modelMatrix);
    modelMatrix.translate(-0.75, -1.05, 0.75);  // Translation
    modelMatrix.scale(0.5, 1.6, 0.5); // Scale
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix1();


////////Second Chair////////////////
  // Rotate, and then translate
  modelMatrix.setTranslate(-5, 0, 0);  // Translation (No translation is supported here)
  modelMatrix.rotate(90, 0, 1, 0); // Rotate along y axis
  modelMatrix.rotate(g_xAngle, 1, 0, 0); // Rotate along x axis

  // Model the chair seat
  PushMatrix1(modelMatrix);
    modelMatrix.scale(2.0, 0.5, 2.0); // Scale
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix1();

  // Model the chair back
  PushMatrix1(modelMatrix);
    modelMatrix.translate(0, 1.25, -0.75);  // Translation
    modelMatrix.scale(2.0, 2.0, 0.5); // Scale
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix1();

  // Model the chair back-right leg
  PushMatrix1(modelMatrix);
    modelMatrix.translate(0.75, -1.05, -0.75);  // Translation
    modelMatrix.scale(0.5, 1.6, 0.5); // Scale
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix1();

  // Model the chair back-left leg
  PushMatrix1(modelMatrix);
    modelMatrix.translate(-0.75, -1.05, -0.75);  // Translation
    modelMatrix.scale(0.5, 1.6, 0.5); // Scale
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix1();

  // Model the chair front-right leg
  PushMatrix1(modelMatrix);
    modelMatrix.translate(0.75, -1.05, 0.75);  // Translation
    modelMatrix.scale(0.5, 1.6, 0.5); // Scale
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix1();

  // Model the chair front-left leg
  PushMatrix1(modelMatrix);
    modelMatrix.translate(-0.75, -1.05, 0.75);  // Translation
    modelMatrix.scale(0.5, 1.6, 0.5); // Scale
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix1();

////////Third Chair/////////////
// Rotate, and then translate
  modelMatrix.setTranslate(0, 0, -5);  // Translation (No translation is supported here)
  modelMatrix.rotate(0, 0, 1, 0); // Rotate along y axis
  modelMatrix.rotate(g_xAngle, 1, 0, 0); // Rotate along x axis

  // Model the chair seat
  PushMatrix1(modelMatrix);
    modelMatrix.scale(2.0, 0.5, 2.0); // Scale
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix1();

  // Model the chair back
  PushMatrix1(modelMatrix);
    modelMatrix.translate(0, 1.25, -0.75);  // Translation
    modelMatrix.scale(2.0, 2.0, 0.5); // Scale
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix1();

  // Model the chair back-right leg
  PushMatrix1(modelMatrix);
    modelMatrix.translate(0.75, -1.05, -0.75);  // Translation
    modelMatrix.scale(0.5, 1.6, 0.5); // Scale
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix1();

  // Model the chair back-left leg
  PushMatrix1(modelMatrix);
    modelMatrix.translate(-0.75, -1.05, -0.75);  // Translation
    modelMatrix.scale(0.5, 1.6, 0.5); // Scale
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix1();

  // Model the chair front-right leg
  PushMatrix1(modelMatrix);
    modelMatrix.translate(0.75, -1.05, 0.75);  // Translation
    modelMatrix.scale(0.5, 1.6, 0.5); // Scale
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix1();

  // Model the chair front-left leg
  PushMatrix1(modelMatrix);
    modelMatrix.translate(-0.75, -1.05, 0.75);  // Translation
    modelMatrix.scale(0.5, 1.6, 0.5); // Scale
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix1();

////////Fourth Chair////////////
// Rotate, and then translate
  modelMatrix.setTranslate(0, 0, 5);  // Translation (No translation is supported here)
  modelMatrix.rotate(180, 0, 1, 0); // Rotate along y axis
  modelMatrix.rotate(g_xAngle, 1, 0, 0); // Rotate along x axis

  // Model the chair seat
  PushMatrix1(modelMatrix);
    modelMatrix.scale(2.0, 0.5, 2.0); // Scale
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix1();

  // Model the chair back
  PushMatrix1(modelMatrix);
    modelMatrix.translate(0, 1.25, -0.75);  // Translation
    modelMatrix.scale(2.0, 2.0, 0.5); // Scale
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix1();

  // Model the chair back-right leg
  PushMatrix1(modelMatrix);
    modelMatrix.translate(0.75, -1.05, -0.75);  // Translation
    modelMatrix.scale(0.5, 1.6, 0.5); // Scale
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix1();

  // Model the chair back-left leg
  PushMatrix1(modelMatrix);
    modelMatrix.translate(-0.75, -1.05, -0.75);  // Translation
    modelMatrix.scale(0.5, 1.6, 0.5); // Scale
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix1();

  // Model the chair front-right leg
  PushMatrix1(modelMatrix);
    modelMatrix.translate(0.75, -1.05, 0.75);  // Translation
    modelMatrix.scale(0.5, 1.6, 0.5); // Scale
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix1();

  // Model the chair front-left leg
  PushMatrix1(modelMatrix);
    modelMatrix.translate(-0.75, -1.05, 0.75);  // Translation
    modelMatrix.scale(0.5, 1.6, 0.5); // Scale
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix1();

////////Desk////////////////////

  gl.uniform1i(u_isTexture, false);
  var colors1 = new Float32Array([    // Colors
    1, 0, 1,   1, 0, 1,   1, 0, 1,  1, 0, 1,     // v0-v1-v2-v3 front
    1, 0, 1,   1, 0, 1,   1, 0, 1,  1, 0, 1,     // v0-v3-v4-v5 right
    1, 0, 1,   1, 0, 1,   1, 0, 1,  1, 0, 1,     // v0-v5-v6-v1 up
    1, 0, 1,   1, 0, 1,   1, 0, 1,  1, 0, 1,     // v1-v6-v7-v2 left
    1, 0, 1,   1, 0, 1,   1, 0, 1,  1, 0, 1,     // v7-v4-v3-v2 down
    1, 0, 1,   1, 0, 1,   1, 0, 1,  1, 0, 1　    // v4-v7-v6-v5 back
  ]);
  var n = initVertexBuffers1(gl, false, colors1);
  if (n < 0) {
    console.log('Failed to set the vertex information');
    return;
  }
  
// Rotate, and then translate
  modelMatrix.setTranslate(0, 1.5, 0);  // Translation (No translation is supported here)
  modelMatrix.rotate(0, 0, 1, 0); // Rotate along y axis
  modelMatrix.rotate(g_xAngle, 1, 0, 0); // Rotate along x axis

  // Model the desk surface
  PushMatrix1(modelMatrix);
    modelMatrix.scale(5.0, 0.5, 5.0); // Scale
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix1();

  // Model the desk back-left leg
  PushMatrix1(modelMatrix);
    modelMatrix.translate(-2.25, -1.6, -2.25);  // Translation
    modelMatrix.scale(0.5, 3.6, 0.5); // Scale
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix1();

// Model the desk front-left leg
  PushMatrix1(modelMatrix);
    modelMatrix.translate(-2.25, -1.6, 2.25);  // Translation
    modelMatrix.scale(0.5, 3.6, 0.5); // Scale
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix1();

  // Model the desk front-right leg
  PushMatrix1(modelMatrix);
    modelMatrix.translate(2.25, -1.6, 2.25);  // Translation
    modelMatrix.scale(0.5, 3.6, 0.5); // Scale
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix1();

  // Model the desk back-right leg
  PushMatrix1(modelMatrix);
    modelMatrix.translate(2.25, -1.6, -2.25);  // Translation
    modelMatrix.scale(0.5, 3.6, 0.5); // Scale
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix1();

  


  //draw the floor
  gl.uniform1i(u_isTexture, false);
  var n = initVertexBuffers1(gl, false, false);
  if (n < 0) {
    console.log('Failed to set the vertex information');
    return;
  }

  //drawTexture (gl, n, u_Sampler);
  //gl.clear(gl.COLOR_BUFFER_BIT);

  // Rotate, and then translate
  modelMatrix.setTranslate(0, -1.9, 0);  // Translation (No translation is supported here)
  modelMatrix.rotate(0, 0, 1, 0); // Rotate along y axis
  modelMatrix.rotate(g_xAngle, 1, 0, 0); // Rotate along x axis

  // Model the floor surface
  PushMatrix1(modelMatrix);
    modelMatrix.scale(15.0, 0.1, 15.0); // Scale
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix1();


  //draw the wall
  //draw the lamb
  gl.uniform1i(u_isTexture, false);

  //    v6----- v5
  //   /|      /|
  //  v1------v0|
  //  | |     | |
  //  | |v7---|-|v4
  //  |/      |/
  //  v2------v3
  var vertices = new Float32Array([   // Coordinates(x,y,z)
     0.0,-3.0, 0.0,   0.0,-3.0, 0.0,  -0.5,-3.5, 0.5,   0.5,-3.5, 0.5, // v0-v1-v2-v3 front
     0.0,-3.0, 0.0,   0.5,-3.5, 0.5,   0.5,-3.5,-0.5,   0.0,-3.0, 0.0, // v0-v3-v4-v5 right
     0.0,-3.0, 0.0,   0.0,-3.0, 0.0,   0.0,-3.0, 0.0,   0.0,-3.0, 0.0, // v0-v5-v6-v1 up
     0.0,-3.0, 0.0,   0.0,-3.0, 0.0,  -0.5,-3.5,-0.5,  -0.5,-3.5, 0.5, // v1-v6-v7-v2 left
    -0.5,-3.5,-0.5,   0.5,-3.5,-0.5,   0.5,-3.5, 0.5,  -0.5,-3.5, 0.5, // v7-v4-v3-v2 down
     0.5,-3.5,-0.5,  -0.5,-3.5,-0.5,   0.0,-3.0, 0.0,   0.0,-3.0, 0.0  // v4-v7-v6-v5 back
  ]);

  var colors2 = new Float32Array([    // Colors
    0.4,1.4,0.4,  0.4,1.4,0.4,  0.4,1.4,0.4, 0.4,1.4,0.4,   // v0-v1-v2-v3 front
    0.4,1.4,0.4,  0.4,1.4,0.4,  0.4,1.4,0.4, 0.4,1.4,0.4,   // v0-v3-v4-v5 right
    0.4,1.4,0.4,  0.4,1.4,0.4,  0.4,1.4,0.4, 0.4,1.4,0.4,   // v0-v5-v6-v1 up
    0.4,1.4,0.4,  0.4,1.4,0.4,  0.4,1.4,0.4, 0.4,1.4,0.4,   // v1-v6-v7-v2 left
    0.4,1.4,0.4,  0.4,1.4,0.4,  0.4,1.4,0.4, 0.4,1.4,0.4,   // v7-v4-v3-v2 down
    0.4,1.4,0.4,  0.4,1.4,0.4,  0.4,1.4,0.4, 0.4,1.4,0.4,   // v4-v7-v6-v5 back
  ]);

  var n = initVertexBuffers1(gl, vertices, colors2);
  if(n < 0) {
    console.log('Failed to set the lamb vertex information');
    return;
  }

  modelMatrix.setTranslate(0, 13, 0);
  modelMatrix.rotate(angle_lamb * 1.5, 1, 0, 1);

  //front leaf
  PushMatrix1(modelMatrix);
    //modelMatrix.translate(0, 0, 0);
    //modelMatrix.rotate(45, 1, 0, 0);
    PushMatrix1(modelMatrix);
      modelMatrix.scale(2.0, 2.0, 2.0); // Scale
      drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
    modelMatrix = popMatrix1();
  modelMatrix = popMatrix1();

  //right leaf
  PushMatrix1(modelMatrix);
    modelMatrix.translate(0, 0, 0);
    modelMatrix.scale(1, 1, 1); 
    modelMatrix.rotate(90, 0, 1, 0);
    PushMatrix1(modelMatrix);
      gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
      //gl.drawArrays(gl.TRIANGLES, 0, n);
    modelMatrix = popMatrix1();
  modelMatrix = popMatrix1();

  //left leaf
  PushMatrix1(modelMatrix);
    modelMatrix.translate(0, 0, 0);
    modelMatrix.scale(1, 1, 1); 
    modelMatrix.rotate(-90, 0, 1, 0);
    PushMatrix1(modelMatrix);
      gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
      //gl.drawArrays(gl.TRIANGLES, 0, n);
    modelMatrix = popMatrix1();
  modelMatrix = popMatrix1();

  //back leaf
  PushMatrix1(modelMatrix);
    modelMatrix.translate(0, 0, 0);
    modelMatrix.scale(1, 1, 1); 
    modelMatrix.rotate(180, 0, 1, 0);
    PushMatrix1(modelMatrix);
      gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
      //gl.drawArrays(gl.TRIANGLES, 0, n);
    modelMatrix = popMatrix1();
  modelMatrix = popMatrix1();

}



function drawbox(gl, u_ModelMatrix, u_NormalMatrix, n) {
  PushMatrix1(modelMatrix);

    // Pass the model matrix to the uniform variable
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);

    // Calculate the normal transformation matrix and pass it to u_NormalMatrix
    g_normalMatrix.setInverseOf(modelMatrix);
    g_normalMatrix.transpose();
    gl.uniformMatrix4fv(u_NormalMatrix, false, g_normalMatrix.elements);
    // Draw the cube
    gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);

  modelMatrix = popMatrix1();
}