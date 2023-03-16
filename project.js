import { defs, tiny } from "./examples/common.js";
import {
  Color_Phong_Shader,
  Buffered_Texture,
  Depth_Texture_Shader_2D,
  LIGHT_DEPTH_TEX_SIZE,
} from "./examples/shadow-demo-shader.js";
import { GameObject, Ground, Player, Ring } from "./gameObject.js";

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

const BANK_ANGLE = 0.015; // How sharp the turns are
const MAX_VERTICAL_ANGLE = -0.2; // Player will always be angled somewhat downward
// const INITIAL_HEIGHT = 600;
// const INITIAL_SPEED = 200;
// const MAX_SPEED = 600;
// const MIN_SPEED = 100;
// const LATERAL_SPEED = 20;
const INITIAL_HEIGHT = 80;
const INITIAL_SPEED = 45;
const MAX_SPEED = 90;
const MIN_SPEED = 40;
const LATERAL_SPEED = 10;
const DIVE_ACCELERATION = 5;
const FLATTEN_DECELERATION = 1;
const CAM_DISTANCE = 20; // How far the camera is from the player

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

    this.reset();

    this.pure = new Material(new Color_Phong_Shader(), {});
    this.shader = new Material(new Color_Phong_Shader(), { ambient: 1.0 });
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

    // this.collider = {intersect_test: GameObject.intersect_sphere, points: new defs.Subdivision_Sphere(8), leeway: .5};
    this.collider = {intersect_test: GameObject.intersect_sphere, points: new defs.Subdivision_Sphere(4), leeway: 0};
  }

  left_vector() {
    return vec3(0, 0, 0);
  }

  flatten_up() {
    console.log(this.playerVelocity)
    if (this.speed > MIN_SPEED)
      this.speed-=FLATTEN_DECELERATION;
    if (this.playerVelocity[1] < MAX_VERTICAL_ANGLE)
      this.playerVelocity.add_by(vec3(0, 0.01, 0));
    // let angleDif = Math.acos(Math.sqrt(this.playerVelocity[1]**2 + this.playerVelocity[2]**2));
    // console.log(angleDif);
    // // let clockwiseRotation = (0 < this.playerVelocity[0] && 0 < this.playerVelocity[2]) || (this.playerVelocity[0] < 0 || this.playerVelocity[2] < 0);
    //
    // // Rotate into YZ plane
    // let newX = this.playerVelocity[0] * Math.cos(-angleDif) - this.playerVelocity[2] * Math.sin(-angleDif);
    // let newY = this.playerVelocity[1];
    // let newZ = this.playerVelocity[0] * Math.sin(-angleDif) + this.playerVelocity[2] * Math.cos(-angleDif);
    //
    // // Rotate along the Z axis
    // // newY = newY * Math.cos(-0.01) - newZ * Math.sin(-0.05);
    // // newZ = newY * Math.sin(-0.01) + newZ * Math.cos(-0.05);
    //
    // // Rotate back out of YZ plane
    // newX = newX * Math.cos(angleDif) - newZ * Math.sin(angleDif);
    // newZ = newX * Math.sin(angleDif) + newZ * Math.cos(angleDif);
    //
    // this.playerVelocity[0] = newX;
    // this.playerVelocity[2] = newZ;
    // = vec3(newX, newY, newZ);
  }

  dive_down() {
    console.log(this.playerVelocity)

    if (this.speed < MAX_SPEED)
      this.speed+=DIVE_ACCELERATION;
    this.playerVelocity.add_by(vec3(0, -0.01, 0));
    // let angleDif = Math.acos(Math.sqrt(this.playerVelocity[1]**2 + this.playerVelocity[2]**2));
    // console.log(angleDif);    // let clockwiseRotation = (0 < this.playerVelocity[0] && 0 < this.playerVelocity[2]) || (this.playerVelocity[0] < 0 || this.playerVelocity[2] < 0);
    //
    // // Rotate into YZ plane
    // let newX = this.playerVelocity[0] * Math.cos(-angleDif) - this.playerVelocity[2] * Math.sin(-angleDif);
    // let newY = this.playerVelocity[1];
    // let newZ = this.playerVelocity[0] * Math.sin(-angleDif) + this.playerVelocity[2] * Math.cos(-angleDif);
    //
    // // Rotate along the X axis
    // // newY = newY * Math.cos(0.01) - newZ * Math.sin(0.05);
    // // newZ = newY * Math.sin(0.01) + newZ * Math.cos(0.05);
    //
    // // Rotate back out of YZ plane
    // newX = newX * Math.cos(angleDif) - newZ * Math.sin(angleDif);
    // newZ = newX * Math.sin(angleDif) + newZ * Math.cos(angleDif);
    // this.playerVelocity[0] = newX;
    // this.playerVelocity[2] = newZ;
    // // this.playerVelocity = vec3(newX, newY, newZ);
  }

  bank_left() {
    let newX = this.playerVelocity[0] * Math.cos(-BANK_ANGLE) - this.playerVelocity[2] * Math.sin(-BANK_ANGLE);
    let newZ = this.playerVelocity[0] * Math.sin(-BANK_ANGLE) + this.playerVelocity[2] * Math.cos(-BANK_ANGLE);
    this.playerVelocity = vec3(newX, this.playerVelocity[1], newZ);
  }

  bank_right() {
    let newX = this.playerVelocity[0] * Math.cos(BANK_ANGLE) - this.playerVelocity[2] * Math.sin(BANK_ANGLE);
    let newZ = this.playerVelocity[0] * Math.sin(BANK_ANGLE) + this.playerVelocity[2] * Math.cos(BANK_ANGLE);
    this.playerVelocity = vec3(newX, this.playerVelocity[1], newZ);
  }

  lateral_left() {
    if (-20 < this.lateral_value)
      this.lateral_value--;
  }

  lateral_right() {
    if (this.lateral_value < 20)
      this.lateral_value++;
  }

  make_control_panel() {
    // Draw the scene's buttons, setup their actions and keyboard shortcuts, and monitor live measurements.
    this.key_triggered_button("Flatten", ["w"], () => this.flatten_up_press = true, "#6E6460", () => this.flatten_up_press = false);
    this.key_triggered_button("Dive down", ["s"], () => this.dive_down_press = true, "#6E6460", () => this.dive_down_press = false);
    this.new_line();
    this.key_triggered_button("Bank Left", ["a"], () => this.bank_left_press = true, "#6E6460", () => this.bank_left_press = false);
    this.key_triggered_button("Bank Right", ["d"], () => this.bank_right_press = true, "#6E6460", () => this.bank_right_press = false);
    this.new_line();
    this.key_triggered_button("Lateral Move Left", ["q"], () => this.lateral_left_press = true, "#6E6460", () => this.lateral_left_press = false);
    this.key_triggered_button("Lateral Move Right", ["e"], () => this.lateral_right_press = true, "#6E6460", () => this.lateral_right_press = false);
    this.new_line();
    this.key_triggered_button("Pause", [" "], () => this.paused = !this.paused);
    this.key_triggered_button("Reset", ["Escape"], () => this.reset());
    this.new_line();
    this.key_triggered_button("Toggle Free Cam", ["l"], () => this.followCamera = !this.followCamera);
  }

  reset() {
    console.log('Reset game');
    this.playerPosition = vec3(0, INITIAL_HEIGHT, 5);
    this.playerVelocity = vec3(0, -0.5, 1);
    this.speed = INITIAL_SPEED;
    this.playerAcceleration = vec3(0, 0, 0);
    this.player = new Player(Mat4.translation(...this.playerPosition));
    this.followCamera = true;

    this.rings = [];

    // Generate rings.
    for (let i = 0; i < 10; i++) {
      const x = Math.random() * 400 - 200;
      const z = 200 + 180 * i;
      const y = -z * Math.sin(Math.PI / 6) + 50 - 20 * Math.random() - 10 * i;
      this.rings.push(new Ring(
        Mat4.translation(x, y, z).times(Mat4.scale(15, 15, 15))
      ));
    }

    this.ground = new Ground(Mat4.identity());
    this.objects = [
      this.ground,
      this.player,
      ...this.rings
    ];

    this.flatten_up_press = false;
    this.dive_down_press = false;
    this.bank_left_press = false;
    this.bank_right_press = false;
    this.lateral_left_press = false;
    this.lateral_right_press = false;

    this.lateral_value = 0;
    this.paused = true;
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
      // if (object === this.ground && !shadow_pass) {
      // continue;
      // }
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

    if (!this.paused) {
      if (this.flatten_up_press)
        this.flatten_up();
      if (this.dive_down_press)
        this.dive_down();
      if (this.bank_left_press)
        this.bank_left();
      if (this.bank_right_press)
        this.bank_right();
      if (this.lateral_left_press)
        this.lateral_left();
      if (this.lateral_right_press)
        this.lateral_right();
      if (!this.lateral_right_press && !this.lateral_left_press && this.lateral_value != 0)
        this.lateral_value -= (0 < this.lateral_value ? 1 : -1);
    }

    this.playerVelocity.normalize();

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
    this.update_state(dt)

    const v = this.playerVelocity.times(this.speed);
    // console.log(this.playerVelocity)
    // console.log(this.playerPosition)

    if (!this.paused) {
      v.scale_by(dt);
      this.playerPosition.add_by(v);
      
      let lateralVec = this.playerVelocity.cross(vec(0, 1, 0)).times(this.lateral_value);
      lateralVec.scale_by(dt*LATERAL_SPEED);
      this.playerPosition.add_by(lateralVec);     
    }

    let rotAngle = vec3(0, 0, Math.sign(this.playerVelocity[2])).cross(this.playerVelocity);

    // console.log(Math.asin(rotAngle.norm()));
 
    const desired = Mat4.look_at(
      // vec3(0, 20, 0),
      vec3(0,0,0).minus(vec3(this.playerVelocity[0], 0, this.playerVelocity[2])),
      vec3(0,0,0),
      // vec3(0, 20, -20),
      // vec3(0, 0, 20),
      vec3(0, -1, 0)
    );
    
    let playerMatrix = Mat4.identity()
      .times(Mat4.translation(...this.playerPosition))
      .times(Mat4.rotation(this.lateral_value/20, ...this.playerVelocity))
      .times(desired)
      ;
    this.player.setBaseTransform(playerMatrix);

    for (let object of this.objects) {
      object.update(program_state);
    }

    // TODO: Lighting (Requirement 2)
    this.light_position = vec4(
        this.playerPosition[0],
        this.playerPosition[1] + 300,
        this.playerPosition[2] - 200,
        // 0,
        // 500,
        // 0,
        1
    );
    // The parameters of the Light are: position, color, size
    program_state.lights = [
      new Light(this.light_position, vec4(1, 1, 1, 1), 10000000000000),
    ];

    this.light_view_target = vec4(
        // 0,-50,50,
        this.playerPosition[0],
        this.playerPosition[1] - 100,
        this.playerPosition[2],
        1
    );
    this.light_field_of_view = (150 * Math.PI) / 180; // 130 degree

    const light_view_mat = Mat4.look_at(
        vec3(
            this.light_position[0],
            this.light_position[1],
            this.light_position[2]
        ),
        vec3(
            this.light_view_target[0],
            this.light_view_target[1],
            this.light_view_target[2] - 10
        ),
        vec3(1, 0, 0) // assume the light to target will have a up dir of +y, maybe need to change according to your case
    );
    const light_proj_mat = Mat4.perspective(
        this.light_field_of_view,
        1,
        5,
        5000
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
          this.playerPosition.minus(this.playerVelocity.times(CAM_DISTANCE)).plus(vec3(0, CAM_DISTANCE/1.5, 0)),
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
        2000
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

    // this.shapes.torus.draw(context, program_state, Mat4.translation(this.light_position[0], this.light_position[1], this.light_position[2]), this.shader.override({color: hex_color("#0000FF")}));

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

  update_state(dt, num_bodies = 40) {
    if (this.paused) {
      return;
    }
    // console.log('update_state',this.player.getBaseTransform());
    // this.player.inverse = Mat4.inverse(this.player.drawn_location);
    this.player.inverse = Mat4.inverse(this.player.getBaseTransform());
    console.log(JSON.stringify(this.player.getBaseTransform()), 'player base');
    // console.log(JSON.stringify(this.objects[2].getBaseTransform()), 'first ring base');
    // console.log(JSON.stringify(this.objects[3].getBaseTransform()), '2nd  ring base');
    // console.log(JSON.stringify(this.player.getBaseTransform()),'player base');
    for (let i = 0; i < this.objects.length; i++) {
      if (this.objects[i] instanceof Player) {
        continue;
      }
      this.objects[i].inverse = Mat4.inverse(this.objects[i].getBaseTransform())
      // this.collider = {intersect_test: GameObject.intersect_sphere, points: new defs.Subdivision_Sphere(8), leeway: .5};
      if (this.player.check_if_colliding(this.objects[i], this.collider)) {
        console.log('Collision: collided', { i });
      } else {
        // console.log('Collision: not colliding');
      }
    }
  }
}
