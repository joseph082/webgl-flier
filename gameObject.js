import { defs, tiny } from "./examples/common.js";
import { Shadow_Textured_Phong_Shader } from "./examples/shadow-demo-shader.js";

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

  Texture,
  Textured_Phong,
  Scene,
} = tiny;

export class GameObject {
  constructor(baseTransform) {
    this.baseTransform = baseTransform;
    this.children = [];
  }

  getBaseTransform() {
    return this.baseTransform;
  }

  setBaseTransform(transform) {
    this.baseTransform = transform;
  }

  update(program_state) {
    for (let child of this.children) {
      child.update(program_state);
    }
  }

  draw(
    context,
    program_state,
    model_transform,
    material_override,
    light_depth_texture
  ) {
    for (let child of this.children) {
      child.draw(
        context,
        program_state,
        model_transform,
        material_override,
        light_depth_texture
      );
    }
  }

  // https://github.com/Robert-Lu/tiny-graphics-demo3/blob/main/examples/collisions-demo.js
  static intersect_cube(p, margin = 0) {
    return p.every((value) => value >= -1 - margin && value <= 1 + margin);
  }

  static intersect_sphere(p, margin = 0) {
    return p.dot(p) < 1 + margin;
  }

  check_if_colliding(b, collider) {
    // check_if_colliding(): Collision detection function.
    // DISCLAIMER:  The collision method shown below is not used by anyone; it's just very quick
    // to code.  Making every collision body an ellipsoid is kind of a hack, and looping
    // through a list of discrete sphere points to see if the ellipsoids intersect is *really* a
    // hack (there are perfectly good analytic expressions that can test if two ellipsoids
    // intersect without discretizing them into points).
    if (this === b) return false;
    // Nothing collides with itself.
    // Convert sphere b to the frame where a is a unit sphere:
    const T = this.inverse.times(
      b.drawn_location ?? b.getBaseTransform(),
      this.temp_matrix ?? Mat4.identity()
    );

    const { intersect_test, points, leeway } = collider;
    // For each vertex in that b, shift to the coordinate frame of
    // a_inv*b.  Check if in that coordinate frame it penetrates
    // the unit sphere at the origin.  Leave some leeway.
    return points.arrays.position.some((p) =>
      intersect_test(T.times(p.to4(1)).to3(), leeway)
    );
  }
}

const shapes = {
  square: new defs.Square(),
  trapezoidalPrism: new defs.Capped_Cylinder(10, 10, Mat4.scale(3, 1, 1)),
  sphere: new defs.Subdivision_Sphere(8),
  cone: new defs.Cone_Tip(10, 10),
  torus: new defs.Torus(16, 16),
  cube: new defs.Cube(),
  cone: new defs.Closed_Cone(10, 10),
  cylinder: new defs.Rounded_Capped_Cylinder(10, 10),
};

for (let i = 0; i < shapes.square.arrays.texture_coord.length; i++) {
  shapes.square.arrays.texture_coord[i][0] *= 50;
  shapes.square.arrays.texture_coord[i][1] *= 50;
}

for (let i = 0; i < shapes.cone.arrays.texture_coord.length; i++) {
  shapes.cone.arrays.texture_coord[i][0] /= 10;
  shapes.cone.arrays.texture_coord[i][1] /= 10;
}

// for (let i = 0; i < shapes.cone.arrays.texture_coord.length; i++) {
//   shapes.cone.arrays.texture_coord[i][0] /= 10;
//   shapes.cone.arrays.texture_coord[i][1] /= 10;
// }

// for (let i = 0; i < shapes.sphere.arrays.texture_coord.length; i++) {
//   shapes.sphere.arrays.texture_coord[i][0] /= 10;
//   shapes.sphere.arrays.texture_coord[i][1] /= 10;
// }

// for (let i = 0; i < shapes.trapezoidalPrism.arrays.texture_coord.length; i++) {
//   shapes.trapezoidalPrism.arrays.texture_coord[i][0] /= 8;
//   shapes.trapezoidalPrism.arrays.texture_coord[i][1] /= 8;
// }

const phong_material = new Material(new Shadow_Textured_Phong_Shader(1));
const rockTexture = new Material(new Shadow_Textured_Phong_Shader(1), {
  // color: hex_color("#7F8386"), // <-- changed base color to black
  ambient: 0.6, // <-- changed ambient to 1
  diffusivity: 0.3, // <-- changed ambient to 1
  specularity: 0.2, // <-- changed ambient to 1
  color_texture: new Texture("assets/rock2.png"),
  // color: hex_color("#555555"),
  smoothness: 64,
  light_depth_texture: null,
});
const snowTexture = new Material(new Shadow_Textured_Phong_Shader(1), {
  ambient: 0.6, // <-- changed ambient to 1
  diffusivity: 0.3, // <-- changed ambient to 1
  specularity: 0.2,
  color_texture: new Texture("assets/snow3.png"),
  // color: hex_color("#FFFFFF"),
  smoothness: 64,
  light_depth_texture: null,
});
const barkTexture = new Material(new Shadow_Textured_Phong_Shader(1), {
  ambient: 1.0,
  diffusivity: 0.6,
  specularity: 0.2,
  color_texture: new Texture("assets/bark.png"),
  smoothness: 64,
  light_depth_texture: null,
});
const leavesTexture = new Material(new Shadow_Textured_Phong_Shader(1), {
  ambient: 0.6,
  diffusivity: 0.4,
  specularity: 0.2,
  color_texture: new Texture("assets/snow2.png"),
  // color: hex_color("#00FF00"),
  smoothness: 64,
  light_depth_texture: null,
});
const playerTexutre = new Material(new Shadow_Textured_Phong_Shader(1), {
  ambient: 0.8,
  diffusivity: 0.4,
  specularity: 0.7,
  // color_texture: new Texture("assets/player.png"),
  color: hex_color("#DD571C"),
  smoothness: 64,
  light_depth_texture: null,
});

const groundRotation = Mat4.rotation((Math.PI * 2) / 3, 1, 0, 0);
const invertedGroundRotation = Mat4.inverse(groundRotation);

export class Player extends GameObject {
  constructor(baseTransform) {
    super(baseTransform);

    this.wingsuitOrange = hex_color("#DD571C");
  }

  draw(
    context,
    program_state,
    model_transform,
    material_override,
    light_depth_texture
  ) {
    // shapes.cube.draw(
    //   context,
    //   program_state,
    //   model_transform
    //     .times(this.getBaseTransform())
    //     .times(Mat4.scale(1, 0.5, 2.5)),
    //   material_override ??
    //   phong_material.override({
    //     ambient: 0.9,
    //     diffusivity: 0.0,
    //     color: this.wingsuitOrange,
    //     light_depth_texture,
    //   })
    // );
    shapes.sphere.draw(
      context,
      program_state,
      model_transform
        .times(this.getBaseTransform())
        .times(Mat4.scale(1.5, 1.5, 1.5)),
      material_override ??
        playerTexutre.override({
          light_depth_texture,
        })
    );

    shapes.cone.draw(
      context,
      program_state,
      model_transform
        .times(this.getBaseTransform())
        .times(Mat4.rotation(-Math.PI / 2, 0, 1, 0))
        .times(Mat4.scale(2, 1, 5)),
      material_override ??
        playerTexutre.override({
          light_depth_texture,
        })
    );

    shapes.cone.draw(
      context,
      program_state,
      model_transform
        .times(this.getBaseTransform())
        .times(Mat4.rotation(Math.PI / 2, 0, 1, 0))
        .times(Mat4.scale(2, 1, 5)),
      material_override ??
        playerTexutre.override({
          light_depth_texture,
        })
    );
    // // bottom cone
    // shapes.cone.draw(
    //   context,
    //   program_state,
    //   model_transform
    //     .times(this.getBaseTransform())
    //     .times(Mat4.translation(0, -2, 0))
    //     .times(Mat4.rotation(0, 0, 1, 0))
    //     .times(Mat4.scale(5, 2, 6)),
    //   material_override ??
    //   playerTexutre.override({
    //     light_depth_texture,
    //   })
    // );
  }
}
export class Ring extends GameObject {
  constructor(baseTransform) {
    super(baseTransform);
  }
  draw(
    context,
    program_state,
    model_transform,
    material_override,
    light_depth_texture
  ) {
    shapes.torus.draw(
      context,
      program_state,
      model_transform.times(this.baseTransform),
      material_override ??
        phong_material.override({
          ambient: 0.4,
          diffusivity: 0.6,
          color: hex_color("#FF0000"),
          light_depth_texture,
        })
    );
  }
}

export class Rock extends GameObject {
  constructor(baseTransform) {
    super(baseTransform);
    this.randomOffsetX = Math.random() * 205;
    this.randomScaling = Math.random() * 1.5 + 0.5;
  }
  draw(
    context,
    program_state,
    model_transform,
    material_override,
    light_depth_texture
  ) {
    // rocks
    shapes.trapezoidalPrism.draw(
      context,
      program_state,
      model_transform
        .times(Mat4.translation(0 + this.randomOffsetX, -1.5, 5.5))
        .times(this.getBaseTransform())
        .times(invertedGroundRotation)
        .times(Mat4.scale(5, 3, 5.5))
        .times(
          Mat4.scale(this.randomScaling, this.randomScaling, this.randomScaling)
        ),
      material_override ??
        rockTexture.override({
          light_depth_texture,
          //color: hex_color("#7F8386"),
        })
    );

    // shapes.cube.draw(
    //   context,
    //   program_state,
    //   model_transform
    //     .times(Mat4.translation(0 + this.randomOffsetX, -1.5, 5.5))
    //     .times(this.getBaseTransform())
    //     .times(invertedGroundRotation)
    //     .times(Mat4.scale(5, 3, 5.5))
    //     .times(
    //       Mat4.scale(this.randomScaling, this.randomScaling, this.randomScaling)
    //     ),
    //   rockTexture.override({
    //     ambient: 0.4,
    //     diffusivity: 0.0,
    //     //color: hex_color("#7F8386"),
    //   })
    // );
  }
}

export class Tree extends GameObject {
  constructor(baseTransform) {
    super(baseTransform);
    this.rockRandomOffsetX = Math.random() * 205;
    this.rockRandomScaling = Math.random() * 1.5 + 0.5;
  }
  draw(
    context,
    program_state,
    model_transform,
    material_override,
    light_depth_texture
  ) {
    const TREE_HEIGHT = 10;
    shapes.cylinder.draw(
      context,
      program_state,
      model_transform
        .times(this.getBaseTransform())
        .times(invertedGroundRotation)
        .times(Mat4.rotation(-Math.PI / 2, 1, 0, 0))
        .times(Mat4.scale(2, 2, TREE_HEIGHT)),
      material_override ?? barkTexture.override({ light_depth_texture })
    );

    // position of this might be centered? so needs to scale more?
    //tree leaves
    shapes.cone.draw(
      context,
      program_state,
      model_transform
        .times(this.getBaseTransform())
        .times(invertedGroundRotation)
        .times(Mat4.rotation(-Math.PI / 2, 1, 0, 0))
        .times(Mat4.translation(0, 0, 15))
        .times(Mat4.scale(4.5, 4.5, TREE_HEIGHT)),
      material_override ?? leavesTexture.override({ light_depth_texture })
    );
  }
}

export class Ground extends GameObject {
  constructor(baseTransform) {
    super(baseTransform);

    for (let i = 0; i < 60; i++) {
      const x = Math.random() * 2000 - 1000;
      const y = Math.random() * 2000;
      const z = -5;
      this.children.push(
        new Tree(Mat4.translation(x, y, z).times(Mat4.scale(2, 3, 2)))
      );
    }
    for (let i = 0; i < 40; i++) {
      const x = Math.random() * 2000 - 1000;
      const y = Math.random() * 2000;
      const z = -5;
      this.children.push(
        new Rock(Mat4.translation(x, y, z).times(Mat4.scale(1.5, 1.5, 1.5)))
      );
    }
  }

  draw(
    context,
    program_state,
    model_transform,
    material_override,
    light_depth_texture
  ) {
    shapes.square.draw(
      context,
      program_state,
      model_transform
        .times(this.getBaseTransform())
        .times(groundRotation.times(Mat4.scale(3000, 3000, 1))),
      material_override ?? snowTexture.override({ light_depth_texture })
    );

    for (let tree of this.children) {
      tree.draw(
        context,
        program_state,
        model_transform.times(this.getBaseTransform()).times(groundRotation),
        material_override,
        light_depth_texture
      );
    }
  }
}
