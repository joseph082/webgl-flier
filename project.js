import { defs, tiny } from "./examples/common.js";
import {
  Color_Phong_Shader,
  Buffered_Texture,
  Depth_Texture_Shader_2D,
  LIGHT_DEPTH_TEX_SIZE,
} from "./examples/shadow-demo-shader.js";
import { Ground, Player, Ring } from "./gameObject.js";

const {
  Vector,
  Vector3,
  vec,
  vec3,
  vec4,
  color,
  Square,
  hex_color,
  Shader,
  Matrix,
  Mat4,
  Light,
  Shape,
  Material,
  Scene,
} = tiny;

export class Game extends Scene {
  constructor() {
    // constructor(): Scenes begin by populating initial values like the Shapes and Materials they'll need.
    super();

    // At the beginning of our program, load one of each of these shape definitions onto the GPU.
    this.shapes = {
      triangle: new defs.Triangle(),
      rect: new defs.Square(),
      torus: new defs.Torus(15, 15),
      square_2d: new defs.Square(),
    };

    this.playerPosition = vec3(0, 20, 5);
    this.playerVelocity = vec3(0, -5, 10);
    this.player = new Player(Mat4.translation(...this.playerPosition));
    this.followCamera = true;

    this.objects = [
      new Ground(Mat4.identity()),
      this.player,
      new Ring(Mat4.translation(0, 0, 50).times(Mat4.scale(15, 15, 15))),
      new Ring(Mat4.scale(15, 15, 15).times(Mat4.translation(1, -15, 30))),
    ];

    this.pure = new Material(new Color_Phong_Shader(), {});
    this.init_ok = false;

    // donut: new defs.Torus(15, 15, [[0, 2], [0, 1]]),
    // cone: new defs.Closed_Cone(4, 10, [[0, 2], [0, 1]]),
    // capped: new defs.Capped_Cylinder(4, 12, [[0, 2], [0, 1]]),
    // ball: new defs.Subdivision_Sphere(3, [[0, 1], [0, 1]]),
    // cube: new defs.Cube(),
    // prism: new (defs.Capped_Cylinder.prototype.make_flat_shaded_version())(10, 10, [[0, 2], [0, 1]]),

    // *** Materials
    this.materials = {
      test: new Material(new defs.Phong_Shader(), {
        ambient: 0.4,
        diffusivity: 0.6,
        color: hex_color("#ffffff"),
      }),
    };

    this.initial_camera_location = Mat4.look_at(
      vec3(0, 20, -20),
      vec3(0, 20, 0),
      vec3(0, 1, 0)
    );

    this.depth_tex = new Material(new Depth_Texture_Shader_2D(), {
      color: color(0, 0, 0.0, 1),
      ambient: 1,
      diffusivity: 0,
      specularity: 0,
      texture: null,
    });
  }

  make_control_panel() {
    // Draw the scene's buttons, setup their actions and keyboard shortcuts, and monitor live measurements.
    this.key_triggered_button(
      "Attach to wingsuit",
      ["Control", "0"],
      () => (this.followCamera = !this.followCamera)
    );
    this.new_line();
    this.key_triggered_button("Move Left", ["a"], () =>
      this.playerVelocity.add_by(vec3(0.5, 0, 0))
    );
    this.new_line();
    this.key_triggered_button("Move Right", ["d"], () =>
      this.playerVelocity.add_by(vec3(-0.5, 0, 0))
    );
  }

  // NOTE: this function is copied from examples/shadow-demo.js
  texture_buffer_init(gl) {
    // Depth Texture
    this.lightDepthTexture = gl.createTexture();
    // Bind it to TinyGraphics
    this.light_depth_texture = new Buffered_Texture(this.lightDepthTexture);

    this.lightDepthTextureSize = LIGHT_DEPTH_TEX_SIZE;
    gl.bindTexture(gl.TEXTURE_2D, this.lightDepthTexture);
    gl.texImage2D(
      gl.TEXTURE_2D, // target
      0, // mip level
      gl.DEPTH_COMPONENT, // internal format
      this.lightDepthTextureSize, // width
      this.lightDepthTextureSize, // height
      0, // border
      gl.DEPTH_COMPONENT, // format
      gl.UNSIGNED_INT, // type
      null
    ); // data
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    // Depth Texture Buffer
    this.lightDepthFramebuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.lightDepthFramebuffer);
    gl.framebufferTexture2D(
      gl.FRAMEBUFFER, // target
      gl.DEPTH_ATTACHMENT, // attachment point
      gl.TEXTURE_2D, // texture target
      this.lightDepthTexture, // texture
      0
    ); // mip level
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    // create a color texture of the same size as the depth texture
    // see article why this is needed_
    this.unusedTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.unusedTexture);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      this.lightDepthTextureSize,
      this.lightDepthTextureSize,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      null
    );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    // attach it to the framebuffer
    gl.framebufferTexture2D(
      gl.FRAMEBUFFER, // target
      gl.COLOR_ATTACHMENT0, // attachment point
      gl.TEXTURE_2D, // texture target
      this.unusedTexture, // texture
      0
    ); // mip level
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }

  render_scene(context, program_state, shadow_pass) {
    const material_override = shadow_pass ? null : this.pure;

    program_state.draw_shadow = shadow_pass;

    for (let object of this.objects) {
      object.draw(
        context,
        program_state,
        Mat4.identity(),
        material_override,
        shadow_pass ? this.light_depth_texture : null
      );
    }
  }

  display(context, program_state) {
    const gl = context.context;

    if (!this.init_ok) {
      const ext = gl.getExtension("WEBGL_depth_texture");
      if (!ext) {
        return alert("need WEBGL_depth_texture"); // eslint-disable-line
      }
      this.texture_buffer_init(gl);

      this.init_ok = true;
    }

    // display():  Called once per frame of animation.
    // Setup -- This part sets up the scene's overall camera matrix, projection matrix, and lights:
    if (!context.scratchpad.controls) {
      this.children.push(
        (context.scratchpad.controls = new defs.Movement_Controls())
      );

      // Define the global camera and projection matrices, which are stored in program_state.
      program_state.set_camera(this.initial_camera_location);
    }

    const dt = program_state.animation_delta_time / 1000;
    const v = this.playerVelocity.copy();
    v.scale_by(dt);
    this.playerPosition.add_by(v);

    const playerMatrix = Mat4.translation(...this.playerPosition);
    this.player.setBaseTransform(playerMatrix);

    for (let object of this.objects) {
      object.update(program_state);
    }

    // TODO: Lighting (Requirement 2)
    this.light_position = vec4(
      this.playerPosition[0],
      this.playerPosition[1] + 10,
      this.playerPosition[2],
      // 0,
      // 10,
      // 0,
      1
    );
    // The parameters of the Light are: position, color, size
    program_state.lights = [
      new Light(this.light_position, vec4(1, 0, 0, 1), 10000000000000),
    ];

    this.light_view_target = vec4(
      this.playerPosition[0],
      this.playerPosition[1] - 1000,
      this.playerPosition[2],
      1
    );
    this.light_field_of_view = (130 * Math.PI) / 180; // 130 degree

    const light_view_mat = Mat4.look_at(
      vec3(
        this.light_position[0],
        this.light_position[1],
        this.light_position[2]
      ),
      vec3(
        this.light_view_target[0],
        this.light_view_target[1],
        this.light_view_target[2]
      ),
      vec3(1, 0, 0) // assume the light to target will have a up dir of +y, maybe need to change according to your case
    );
    const light_proj_mat = Mat4.perspective(
      this.light_field_of_view,
      1,
      5,
      500000
    );
    // Bind the Depth Texture Buffer
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.lightDepthFramebuffer);
    gl.viewport(0, 0, this.lightDepthTextureSize, this.lightDepthTextureSize);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Prepare uniforms
    program_state.light_view_mat = light_view_mat;
    program_state.light_proj_mat = light_proj_mat;
    program_state.light_tex_mat = light_proj_mat;
    program_state.view_mat = light_view_mat;
    program_state.projection_transform = light_proj_mat;
    this.render_scene(context, program_state, false);

    // Step 2: unbind, draw to the canvas
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    if (this.followCamera) {
      // const dv = this.playerVelocity.copy();
      // dv.scale_by(-6);
      const desired = Mat4.look_at(
        // vec3(0, 20, 0),
        this.playerPosition.plus(vec3(0, 15, -25)),
        this.playerPosition,
        // vec3(0, 20, -20),
        // vec3(0, 0, 20),
        vec3(0, 1, 0)
      );
      program_state.set_camera(desired);
    }

    program_state.projection_transform = Mat4.perspective(
      Math.PI / 4,
      context.width / context.height,
      0.1,
      1000
    );

    program_state.view_mat = program_state.camera_inverse;
    this.render_scene(context, program_state, true);

    // Step 3: display the textures
    // this.shapes.square_2d.draw(
    //   context,
    //   program_state,
    //   Mat4.translation(-0.99, 0.08, 0).times(
    //     Mat4.scale(0.5, (0.5 * gl.canvas.width) / gl.canvas.height, 1)
    //   ),
    //   this.depth_tex.override({ texture: this.lightDepthTexture })
    // );

    // x-axis is blue
    // this.shapes.rect.draw(
    //   context,
    //   program_state,
    //   Mat4.scale(1000, 0.5, 1),
    //   this.materials.test.override({ color: hex_color("#000055") })
    // );

    // y-axis is red
    // this.shapes.rect.draw(
    //   context,
    //   program_state,
    //   Mat4.scale(1, 1000, 1),
    //   this.materials.test.override({ color: hex_color("#FF0000") })
    // );

    // z-axis is
    // this.shapes.torus.draw(
    //   context,
    //   program_state,
    //   Mat4.scale(1, 0.5, 1000),
    //   this.materials.test.override({ color: hex_color("#FF00FF") })
    // );
  }
}
