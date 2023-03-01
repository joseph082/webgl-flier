import { defs, tiny } from "./examples/common.js";

const {
  Vector,
  Vector3,
  vec,
  vec3,
  vec4,
  color,
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
      torus: new defs.Torus(15, 15),
    };

    // *** Materials
    this.materials = {
      test: new Material(new defs.Phong_Shader(), {
        ambient: 0.4,
        diffusivity: 0.6,
        color: hex_color("#ffffff"),
      }),
    };

    this.initial_camera_location = Mat4.look_at(
      vec3(0, 10, 20),
      vec3(0, 0, 0),
      vec3(0, 1, 0)
    );
  }

  make_control_panel() {
    // Draw the scene's buttons, setup their actions and keyboard shortcuts, and monitor live measurements.
    this.key_triggered_button(
      "View solar system",
      ["Control", "0"],
      () => (this.attached = () => null)
    );
    this.new_line();
    this.key_triggered_button(
      "Attach to planet 1",
      ["Control", "1"],
      () => (this.attached = () => this.planet_1)
    );
    this.key_triggered_button(
      "Attach to planet 2",
      ["Control", "2"],
      () => (this.attached = () => this.planet_2)
    );
    this.new_line();
    this.key_triggered_button(
      "Attach to planet 3",
      ["Control", "3"],
      () => (this.attached = () => this.planet_3)
    );
    this.key_triggered_button(
      "Attach to planet 4",
      ["Control", "4"],
      () => (this.attached = () => this.planet_4)
    );
    this.new_line();
    this.key_triggered_button(
      "Attach to moon",
      ["Control", "m"],
      () => (this.attached = () => this.moon)
    );
  }

  display(context, program_state) {
    // display():  Called once per frame of animation.
    // Setup -- This part sets up the scene's overall camera matrix, projection matrix, and lights:
    if (!context.scratchpad.controls) {
      this.children.push(
        (context.scratchpad.controls = new defs.Movement_Controls())
      );

      // Define the global camera and projection matrices, which are stored in program_state.
      program_state.set_camera(this.initial_camera_location);
    }

    program_state.projection_transform = Mat4.perspective(
      Math.PI / 4,
      context.width / context.height,
      0.1,
      1000
    );

    // TODO: Lighting (Requirement 2)
    const light_position = vec4(0, 0, 10, 1);
    // The parameters of the Light are: position, color, size
    program_state.lights = [new Light(light_position, vec4(1, 1, 1, 1), 100)];

    this.shapes.torus.draw(
      context,
      program_state,
      Mat4.identity(),
      this.materials.test.override({ color: hex_color("#FFFF00") })
    );
  }
}
