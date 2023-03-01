import { defs, tiny } from "./examples/common.js";
import { Ground, Player } from "./gameObject.js";

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
      triangle: new defs.Triangle(),
      rect: new defs.Square(),
      torus: new defs.Torus(15, 15),
    };

    this.objects = [
      new Ground(Mat4.identity()),
      new Player(Mat4.translation(0, 10, 0)),
    ];

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

    for (let object of this.objects) {
      object.update(program_state);
    }

    // TODO: Lighting (Requirement 2)
    const light_position = vec4(0, 10, 0, 1);
    // The parameters of the Light are: position, color, size
    program_state.lights = [new Light(light_position, vec4(1, 1, 1, 1), 100)];

    for (let object of this.objects) {
      object.draw(context, program_state, Mat4.identity());
    }

    // x-axis is blue
    this.shapes.rect.draw(
      context,
      program_state,
      Mat4.scale(1000, 0.5, 1),
      this.materials.test.override({ color: hex_color("#000055") })
    );

    // y-axis is red
    this.shapes.rect.draw(
      context,
      program_state,
      Mat4.scale(1, 1000, 1),
      this.materials.test.override({ color: hex_color("#FF0000") })
    );

    // z-axis is
    this.shapes.torus.draw(
      context,
      program_state,
      Mat4.scale(1, 0.5, 1000),
      this.materials.test.override({ color: hex_color("#FF00FF") })
    );
  }
}
