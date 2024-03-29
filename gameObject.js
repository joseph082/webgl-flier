import { defs, tiny } from "./examples/common.js";
import { Shadow_Textured_Phong_Shader } from "./examples/shadow-demo-shader.js";

const {
  vec4,
  hex_color,
  Mat4,
  Material,

  Texture,
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
    for (const child of this.children) {
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
    for (const child of this.children) {
      child.draw(
        context,
        program_state,
        model_transform,
        material_override,
        light_depth_texture
      );
    }
  }

  getPosition() {
    return {
      x: this.baseTransform[0][3],
      y: this.baseTransform[1][3],
      z: this.baseTransform[2][3],
    };
  }
}

const shapes = {
  square: new defs.Square(),
  trapezoidalPrism: new defs.Capped_Cylinder(10, 10, Mat4.scale(3, 1, 1)),
  sphere: new defs.Subdivision_Sphere(8),
  cone_tip: new defs.Cone_Tip(10, 10),
  torus: new defs.Torus(16, 16),
  cube: new defs.Cube(),
  cone: new defs.Closed_Cone(10, 10),
  cylinder: new defs.Rounded_Capped_Cylinder(10, 10),
  rounded_cone: new defs.Rounded_Closed_Cone(10, 10),
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

const MOUNTAIN_HEIGHT = 250;
const MOUNTAIN_WIDTH = 150;

const phong_material = new Material(new Shadow_Textured_Phong_Shader(1));
const tireMaterial = new Material(new Shadow_Textured_Phong_Shader(1), {
  color: hex_color("#000000"),
});
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
const playerTexture = new Material(new Shadow_Textured_Phong_Shader(1), {
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
    this.lastBaseTransform = baseTransform;
  }

  setBaseTransform(transform) {
    this.lastBaseTransform = this.baseTransform;
    this.baseTransform = transform;
  }
  getLastPosition() {
    return {
      x: this.lastBaseTransform[0][3],
      y: this.lastBaseTransform[1][3],
      z: this.lastBaseTransform[2][3],
    };
  }

  draw(
    context,
    program_state,
    model_transform,
    material_override,
    light_depth_texture
  ) {
    shapes.sphere.draw(
      context,
      program_state,
      model_transform
        .times(this.getBaseTransform())
        .times(Mat4.scale(1.5, 1.5, 1.5)),
      material_override ??
        playerTexture.override({
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
        playerTexture.override({
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
        playerTexture.override({
          light_depth_texture,
        })
    );
    // // bottom cone
    shapes.cone.draw(
      context,
      program_state,
      model_transform
        .times(this.getBaseTransform())
        .times(Mat4.translation(0, 0, 5))
        .times(Mat4.rotation(Math.PI, 0, 1, 0))
        .times(Mat4.scale(4, 2, 4)),
      material_override ??
        playerTexture.override({
          light_depth_texture,
        })
    );
  }
}
export class Ring extends GameObject {
  constructor(baseTransform) {
    super(baseTransform);
    this.ringSize = baseTransform[0][0];
    this.collided = false;
  }

  checkPlayerCollision(
    playerX,
    playerY,
    playerZ,
    lastPlayerX,
    lastPlayerY,
    lastPlayerZ
  ) {
    if (this.collided) {
      return false;
    }
    const ringZ = this.baseTransform[2][3];

    if (ringZ <= lastPlayerZ || ringZ >= playerZ) {
      return false;
    }
    const ringX = this.baseTransform[0][3],
      ringY = this.baseTransform[1][3];

    const dx = playerX - lastPlayerX;
    const dy = playerY - lastPlayerY;
    const dz = playerZ - lastPlayerZ;

    const dt = dz !== 0 ? (ringZ - lastPlayerZ) / dz : 0;
    const approxPlayerX = lastPlayerX + dx * dt;
    const approxPlayerY = lastPlayerY + dy * dt;
    // console.log({ playerX, lastPlayerX, approxPlayerX });
    if (
      Math.sqrt((approxPlayerX - ringX) ** 2 + (approxPlayerY - ringY) ** 2) <
      this.ringSize / 2 + 10
    ) {
      // console.log("collided with ring", {
      //   dist: Math.sqrt(
      //     (approxPlayerX - ringX) ** 2 + (approxPlayerY - ringY) ** 2
      //   ),
      // });
      this.collided = true;
      return true;
    }
    return false;
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

  checkPlayerCollision() {
    return false;
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
  }

  checkPlayerCollision(playerX, playerY, playerZ) {
    // height = 50, r = 5
    const treeCoords = groundRotation
      .times(this.baseTransform)
      .times(invertedGroundRotation)
      .times(Mat4.rotation(-Math.PI / 2, 1, 0, 0))
      .times(Mat4.translation(0, 0, 15));
    const treeX = treeCoords[0][3],
      treeY = treeCoords[1][3],
      treeZ = treeCoords[2][3];
    // console.log({ treeX, treeY, treeZ });
    const collisionRadius = 9;
    if (
      playerY > treeY + 100 ||
      playerY <= treeY - 100 ||
      Math.abs(playerX - treeX) > collisionRadius ||
      Math.abs(playerZ - treeZ) > collisionRadius
    ) {
      return false;
    }
    const dy = treeY + 50 - playerY;
    const circleRadius = (18 / 50) * dy;
    // console.log({
    //   dist: Math.sqrt((playerX - treeX) ** 2 + (playerZ - treeZ) ** 2),
    //   circleRadius,
    //   dL: circleRadius + 6,
    // });
    if (
      Math.sqrt((playerX - treeX) ** 2 + (playerZ - treeZ) ** 2) <
      circleRadius + 3
    ) {
      // console.log("collided with tree", {
      //   dist: Math.sqrt((playerX - treeX) ** 2 + (playerZ - treeZ) ** 2),
      //   dy,
      // });
      return true;
    }
    return false;
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
    shapes.cylinder.draw(
      context,
      program_state,
      model_transform
        .times(this.getBaseTransform())
        .times(invertedGroundRotation)
        .times(Mat4.scale(1, 10, 1)),
      material_override ?? barkTexture.override({ light_depth_texture })
    );

    // shapes.cylinder;

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

export class Mountain extends GameObject {
  constructor(baseTransform) {
    super(baseTransform);
  }

  checkPlayerCollision(playerX, playerY, playerZ) {
    // const MOUNTAIN_HEIGHT = 400;
    // const MOUNTAIN_WIDTH = 200;
    const mountainCoords = groundRotation
      .times(this.baseTransform)
      .times(invertedGroundRotation)
      .times(Mat4.rotation(-Math.PI / 2, 1, 0, 0))
      .times(Mat4.scale(MOUNTAIN_WIDTH, MOUNTAIN_WIDTH, MOUNTAIN_HEIGHT));
    const mountainX = mountainCoords[0][3],
      mountainY = mountainCoords[1][3],
      mountainZ = mountainCoords[2][3];
    const collisionRadius = MOUNTAIN_WIDTH;
    if (
      playerY > mountainY + 250 * 2 ||
      playerY <= mountainY - 250 ||
      Math.abs(playerX - mountainX) > collisionRadius ||
      Math.abs(playerZ - mountainZ) > collisionRadius
    ) {
      return false;
    }
    const dy = mountainY + MOUNTAIN_HEIGHT - playerY;
    const circleRadius = (MOUNTAIN_WIDTH / 2 / MOUNTAIN_HEIGHT) * dy;
    // console.log({
    //   dist: Math.sqrt((playerX - treeX) ** 2 + (playerZ - treeZ) ** 2),
    //   circleRadius,
    //   dL: circleRadius + 6,
    // });
    if (
      Math.sqrt((playerX - mountainX) ** 2 + (playerZ - mountainZ) ** 2) <
      circleRadius + 4
    ) {
      // console.log("collided with tree", {
      //   dist: Math.sqrt((playerX - treeX) ** 2 + (playerZ - treeZ) ** 2),
      //   dy,
      // });
      return true;
    }
    return false;
  }

  draw(
    context,
    program_state,
    model_transform,
    material_override,
    light_depth_texture
  ) {
    shapes.rounded_cone.draw(
      context,
      program_state,
      model_transform
        .times(this.getBaseTransform())
        .times(invertedGroundRotation)
        .times(Mat4.rotation(-Math.PI / 2, 1, 0, 0))
        .times(Mat4.scale(MOUNTAIN_WIDTH, MOUNTAIN_WIDTH, MOUNTAIN_HEIGHT)),
      material_override ?? snowTexture.override({ light_depth_texture })
    );
  }
}

export class Ground extends GameObject {
  checkPlayerCollision(playerX, playerY, playerZ) {
    const normal = vec4(0, Math.cos(Math.PI / 6), Math.sin(Math.PI / 6), 0);
    const distance = normal.dot(
      vec4(playerX, playerY, playerZ, 0).minus(
        vec4(0, -Math.sin(Math.PI / 6), Math.cos(Math.PI / 6), 0)
      )
    );

    return distance < 4.0;
  }

  constructor(baseTransform) {
    super(baseTransform);

    // Generate trees
    for (let i = 0; i < 60; i++) {
      const x = Math.random() * 2000 - 1000;
      const y = Math.random() * 2000;
      const z = -5;
      this.children.push(
        new Tree(Mat4.translation(x, y, z).times(Mat4.scale(2.5, 5, 2.5)))
      );
    }

    // Generate rocks
    for (let i = 0; i < 40; i++) {
      const x = Math.random() * 2000 - 1000;
      const y = Math.random() * 2000;
      const z = -5;
      this.children.push(
        new Rock(Mat4.translation(x, y, z).times(Mat4.scale(2.5, 2.5, 2.5)))
      );
    }

    // Generate mountains on the left
    for (let i = 0; i < 35; i++) {
      const x = -Math.random() * 400 - 350;
      const y = Math.random() * 2000;
      const z = -MOUNTAIN_HEIGHT + 100;
      this.children.push(new Mountain(Mat4.translation(x, y, z)));
    }

    // Generate mountains on the right
    for (let i = 0; i < 35; i++) {
      const x = Math.random() * 400 + 350;
      const y = Math.random() * 2000;
      const z = -MOUNTAIN_HEIGHT + 100;
      this.children.push(new Mountain(Mat4.translation(x, y, z)));
    }

    // Generate mountains in the center
    for (let i = 0; i < 10; i++) {
      const x = Math.random() * 500 - 250;
      const y = Math.random() * 2000 + 500;
      const z = -MOUNTAIN_HEIGHT + 100;
      this.children.push(new Mountain(Mat4.translation(x, y, z)));
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
      material_override ?? snowTexture.override({ color: hex_color("#808080") })
    );

    for (let tree of this.children) {
      const transform = model_transform
        .times(this.getBaseTransform())
        .times(groundRotation);

      tree.draw(
        context,
        program_state,
        transform,
        material_override,
        light_depth_texture
      );
    }
  }
}

export class FinishGround extends GameObject {
  constructor(baseTransform) {
    super(baseTransform);
  }

  draw(context, program_state, model_transform, material_override, _) {
    const GROUND_Y = -1500;
    shapes.square.draw(
      context,
      program_state,
      model_transform
        .times(this.baseTransform)
        .times(Mat4.translation(0, GROUND_Y, 2500))
        .times(Mat4.scale(3000, 3000, 3000))
        .times(Mat4.rotation(Math.PI / 2, 1, 0, 0)),
      material_override ?? snowTexture.override({ color: hex_color("#808080") })
    );

    const CABIN_Z = 2750;
    //roof
    shapes.cone_tip.draw(
      context,
      program_state,
      model_transform
        .times(this.baseTransform)
        .times(Mat4.translation(0, GROUND_Y+72, CABIN_Z))
        .times(Mat4.scale(55, -20, 55))
        .times(Mat4.rotation(Math.PI / 2, 1, 0, 0)),
      material_override ?? barkTexture.override({})
    );
    //door
    shapes.cube.draw(
      context,
      program_state,
      model_transform
        .times(this.baseTransform)
        .times(Mat4.translation(0, GROUND_Y, CABIN_Z-30.2))
        .times(Mat4.scale(5, -20, -0.2)),
      material_override ?? phong_material.override({color:hex_color('#b99976')})
    );

    //doorknob
    shapes.cube.draw(
      context,
      program_state,
      model_transform
        .times(this.baseTransform)
        .times(Mat4.translation(-2.2, GROUND_Y + 9, CABIN_Z-30.4))
        .times(Mat4.scale(1, -1, -0.2)),
      material_override ?? phong_material.override({color:hex_color('#111111')})
    );

    // log cabin
    shapes.cube.draw(
      context,
      program_state,
      model_transform
        .times(this.baseTransform)
        .times(Mat4.translation(0, GROUND_Y, CABIN_Z))
        .times(Mat4.scale(30, -60, 30)),
      material_override ?? barkTexture.override({})
    );

    //truck body
    shapes.cube.draw(
      context,
      program_state,
      model_transform
        .times(this.baseTransform)
        .times(Mat4.translation(50, GROUND_Y + 10, CABIN_Z))
        .times(Mat4.scale(15, -5, 5)),
      material_override ?? phong_material.override({ color: hex_color('#0000ff') })
    );

    shapes.cube.draw(
      context,
      program_state,
      model_transform
        .times(this.baseTransform)
        .times(Mat4.translation(40, GROUND_Y + 15, CABIN_Z))
        .times(Mat4.scale(5, -5, 5)),
      material_override ?? phong_material.override({ color: hex_color('#0000ff') })
    );

    // two wheels
    shapes.sphere.draw(
      context,
      program_state,
      model_transform
        .times(this.baseTransform)
        .times(Mat4.translation(58, GROUND_Y + 5, CABIN_Z - 5))
        .times(Mat4.scale(3, -3, 3)),
      material_override ?? tireMaterial
    );

    shapes.sphere.draw(
      context,
      program_state,
      model_transform
        .times(this.baseTransform)
        .times(Mat4.translation(40, GROUND_Y + 5, CABIN_Z - 5))
        .times(Mat4.scale(3, -3, 3)),
      material_override ?? tireMaterial
    );

    //red car
    const CAR_Z = CABIN_Z - 27;
    shapes.cube.draw(
      context,
      program_state,
      model_transform
        .times(this.baseTransform)
        .times(Mat4.translation(50, GROUND_Y + 10, CAR_Z))
        .times(Mat4.scale(15, -5, 5)),
      material_override ?? phong_material.override({ color: hex_color('#dd0000') })
    );

    shapes.cube.draw(
      context,
      program_state,
      model_transform
        .times(this.baseTransform)
        .times(Mat4.translation(48, GROUND_Y + 15, CAR_Z))
        .times(Mat4.scale(8, -5, 5)),
      material_override ?? phong_material.override({ color: hex_color('#dd0000') })
    );


    shapes.sphere.draw(
      context,
      program_state,
      model_transform
        .times(this.baseTransform)
        .times(Mat4.translation(58, GROUND_Y + 5, CAR_Z - 5))
        .times(Mat4.scale(3, -3, 3)),
      material_override ?? tireMaterial
    );

    shapes.sphere.draw(
      context,
      program_state,
      model_transform
        .times(this.baseTransform)
        .times(Mat4.translation(40, GROUND_Y + 5, CAR_Z - 5))
        .times(Mat4.scale(3, -3, 3)),
      material_override ?? tireMaterial
    );

    // for (let tree of this.children) {
    //   const transform = model_transform
    //     .times(groundRotation);
    //
    //   tree.draw(
    //     context,
    //     program_state,
    //     transform,
    //     material_override,
    //     light_depth_texture
    //   );
    // }
  }
}

export class FinishRing extends GameObject {
  constructor(baseTransform) {
    super(baseTransform);
    this.ringSize = baseTransform[0][0] * 250;
    this.collided = false;
  }

  checkPlayerCollision(
    playerX,
    playerY,
    playerZ,
    lastPlayerX,
    lastPlayerY,
    lastPlayerZ
  ) {
    if (this.collided) {
      return false;
    }
    const baseTransform = this.baseTransform.times(
      Mat4.translation(0, -1100, 2500)
    );
    const ringZ = baseTransform[2][3];

    if (ringZ <= lastPlayerZ || ringZ >= playerZ) {
      return false;
    }
    const ringX = baseTransform[0][3],
      ringY = baseTransform[1][3];

    const dx = playerX - lastPlayerX;
    const dy = playerY - lastPlayerY;
    const dz = playerZ - lastPlayerZ;

    const dt = dz !== 0 ? (ringZ - lastPlayerZ) / dz : 0;
    const approxPlayerX = lastPlayerX + dx * dt;
    const approxPlayerY = lastPlayerY + dy * dt;

    if (
      Math.sqrt((approxPlayerX - ringX) ** 2 + (approxPlayerY - ringY) ** 2) <
      this.ringSize
    ) {
      console.log("collided with ring", {
        dist: Math.sqrt(
          (approxPlayerX - ringX) ** 2 + (approxPlayerY - ringY) ** 2
        ),
      });
      this.collided = true;
      return true;
    }
    return false;
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
      model_transform
        .times(this.baseTransform)
        .times(Mat4.translation(0, -1200, 2500))
        .times(Mat4.scale(250, 250, 250)),
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
