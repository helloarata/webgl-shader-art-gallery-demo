export class WebGLGeometry {
  constructor(){

  }
  // 板ポリ
  plane(width, height, color){
    const w   = width  / 2;
    const h   = height / 2;
    const pos = [
      -w,  h, 0.0,
       w,  h, 0.0,
      -w, -h, 0.0,
       w, -h, 0.0,
    ];
    const nor = [
      0.0, 0.0, 1.0,
      0.0, 0.0, 1.0,
      0.0, 0.0, 1.0,
      0.0, 0.0, 1.0,
    ];
    const col = [
      color[0], color[1], color[2], color[3],
      color[0], color[1], color[2], color[3],
      color[0], color[1], color[2], color[3],
      color[0], color[1], color[2], color[3],
    ];
    const st  = [
      0.0, 0.0,
      1.0, 0.0,
      0.0, 1.0,
      1.0, 1.0,
    ];
    // const st = [
    //   0.0, 1.0,
    //   1.0, 1.0,
    //   0.0, 0.0,
    //   1.0, 0.0,
    // ];
    const ind = [
      0, 2, 1,
      1, 2, 3,
    ];
    const mouseCoe = [
      0.0,
      0.0,
      0.0,
      0.0,
    ];
    return { position: pos, normal: nor, color: col, texCoord: st, index: ind, mouseCoefficient: mouseCoe };
  }

  // 軸線
  axis(){
    const pos = [
      0.0, 0.0, 0.0,
      1.0, 0.0, 0.0,
      0.0, 0.0, 0.0,
      0.0, 1.0, 0.0,
      0.0, 0.0, 0.0,
      0.0, 0.0, 1.0,
    ];
    const col = [
      0.5, 0.0, 0.0, 1.0,
      1.0, 0.2, 0.0, 1.0,
      0.0, 0.5, 0.0, 1.0,
      0.0, 1.0, 0.2, 1.0,
      0.0, 0.0, 0.5, 1.0,
      0.2, 0.0, 1.0, 1.0,
    ];
    return { position: pos, color: col };
  }

  // 板
  pointsBoard(split, width){
    const pos = [];
    const col = [];
    for(let i = 0; i < split; ++i){
      // x座標 仮に vertexCount が 100 だとすると、0.0 から始まり 0.01 ~ 1.0 までの座標を得る
      let x = i / split;
      // 0.0 ~ 1.0 のx座標の間隔を空ける
      // vertexWidth が2.0と仮定して、0.01 * 2.0 - (1.0) 結果として -0.98 を得る
      x = x * width - (width / 2.0);
      for(let j = 0; j < split; ++j){
        // y座標
        let y = j / split;
        
        y = y * width - (width / 2.0);
        // xy座標を格納
        pos.push(x, y, 0.0);
        col.push(i / split, j / split, 0.5, 1.0);
      }
    }
    return { position: pos, color: col };
  }

  // 円
  circle(split, radius, color){
    const pos = [];
    const nor = [];
    const col = [];
    const st  = [];
    const idx = [];
    pos.push(0.0, 0.0, 0.0);
    nor.push(0.0, 0.0, 1.0);
    col.push(color[0], color[1], color[2], color[3]);
    st.push(0.5, 0.5);
    let j = 0;
    for(let i = 0; i < split; i++){
      const r  = Math.PI * 2.0 / split * i;
      const rx = Math.cos(r);
      const ry = Math.sin(r);
      pos.push(rx * radius, ry * radius, 0.0);
      nor.push(0.0, 0.0, 1.0);
      col.push(color[0], color[1], color[2], color[3]);
      st.push( (rx + 1.0) * 0.5, 1.0 - (ry + 1.0) * 0.5);
      if(1 === split - 1){
        idx.push(0, j + 1, 1);
      } else {
        idx.push(0, j + 1, j + 2);
      }
      ++j;
    }
    return { position: pos, normal: nor, color: col, texCoord: st, index: idx };
  }

  // 円板
  disk(split, radius, count, color){
    const pos = [];
    const nor = [];
    const col = [];
    const st  = [];
    const idx = [];
    pos.push(0.0, 0.0, 0.0);
    nor.push(0.0, 0.0, 1.0);
    col.push(color[0], color[1], color[2], color[3]);
    st.push(0.5, 0.5);
    let k = 0;
    for(let i = 0; i < count; i++){
      let r = i * 0.1;
      for(let j = 0; j < split; j++){
        const radian = Math.PI * 2.0 / split * j;
        const x = Math.cos(radian)* radius * r;
        const y = Math.sin(radian)* radius * r;
        pos.push(x, y, 0.0);
        nor.push(0.0, 0.0, 1.0);
        col.push(color[0], color[1], color[2], color[3]);
        st.push( (x + 1.0) * 0.5, 1.0 - (y + 1.0) * 0.5);
        if(j === split - 1){
          idx.push(0, k + 1, 1);
        } else {
          idx.push(0, k + 1, k + 2);
        }
        ++k;
      }
    }
    return { position: pos, normal: nor, color: col, texCoord: st, index: idx };   
  }

  // 円筒
  cylinder(split, headRadius, rodRadius, count, height, color){
    const pos = [];
    const nor = [];
    const col = [];
    const st  = [];
    const idx = [];
    const h   = height / 2;
    pos.push(
      0.0, 0.0,   h, // 天面の中心座標
      0.0, 0.0,  -h, // 底面の中心座標
    );
    nor.push(
      0.0, 0.0,  1.0,
      0.0, 0.0, -1.0,
    );
    col.push(
      color[0], color[1], color[2], color[3],
      color[0], color[1], color[2], color[3],
    );
    st.push(
      0.5, 0.5,
      0.5, 0.5,
    );
    let k = 2;
    for(let i = 0; i < count; i++){
      let   r    = i * 0.1;
      const rrr  = (count - 1) * 0.1;
      const hr   = headRadius;
      const rr   = rodRadius;
      for(let j  = 0; j < split; j++){
        const radian = Math.PI * 2.0 / split * j;
        const x      = Math.cos(radian);
        const y      = Math.sin(radian);
        // シリンダーの head 部分
        pos.push(
          x * hr * r, y * hr * r,  h,
          x * hr * r, y * hr * r, -h,
        );
        nor.push(
          0.0, 0.0,  1.0,
          0.0, 0.0, -1.0,
          0.0, 0.0, -1.0,
          0.0, 0.0, -1.0,
        );
        col.push(
          color[0], color[1], color[2], color[3],
          color[0], color[1], color[2], color[3],
        );
        st.push(
          (x + 1.0) * 0.5, 1.0 - (y + 1.0) * 0.5,
          (x + 1.0) * 0.5, 1.0 - (y + 1.0) * 0.5,
          (x + 1.0) * 0.5, 1.0 - (y + 1.0) * 0.5,
          (x + 1.0) * 0.5, 1.0 - (y + 1.0) * 0.5,
        );
        // シリンダーの rod 部分
        pos.push(
          x * rr * rrr, y * rr * rrr,  (h / count) * i,
          x * rr * rrr, y * rr * rrr,  (-h / count) * i,
        );
        col.push(
          color[0], color[1], color[2], color[3],
          color[0], color[1], color[2], color[3],
        );
        if(j !== split - 1){
          idx.push(
            0,     k + 4, k,
            1,     k + 2, k + 6,
            k + 5, k + 7, k + 1,
            k + 1, k + 7, k + 3,
          );
        }
        k += 4;
      }
    }
    return { position: pos, normal: nor, color: col, texCoord: st, index: idx };
   }

   // 球体
   sphere(row, column, radius, color){
    const pos = [];
    const nor = [];
    const col = [];
    const st  = [];
    const idx = [];
    for(let i = 0; i <= row; i++){
      // 緯度を求める
      const latitude  = Math.PI / row * i;
      const latitudeX = Math.sin(latitude);
      const latitudeY = Math.cos(latitude);
      for(let j = 0; j <= column; j++){
        // 経度を求める
        const longitude  = Math.PI * 2 / column * j;
        const longitudeX = Math.cos(longitude);
        const longitudeZ = Math.sin(longitude);
        const x = latitudeX * radius * longitudeX;
        const y = latitudeY * radius;
        const z = latitudeX * radius * longitudeZ;
        pos.push(x, y, z);
        nor.push(latitudeX * longitudeX, latitudeY * radius, latitudeX * longitudeZ);
        col.push(color[0], color[1], color[2], color[3]);
        st.push(1 -1 / column * j, 1 / row * i);
      }
    }
    for(let i = 0; i < row; i++){
      for(let j = 0; j < column; j++){
        const r = (column + 1) * i + j;
        idx.push(r,          r + 1, r + column + 2);
        idx.push(r, r + column + 2, r + column + 1);
      }
    }
    return { position: pos, normal: nor, color: col, texCoord: st, index: idx }
   }

   // 
   towTypes(count, width, radius){
    const pPos = [];
    const pCol = [];
    const sPos = [];
    const sCol = [];
    for(let i = 0; i < count; i++){
      {
        let x = i / count;
        x = x * width - (width / 2.0);
        for(let j = 0; j < count; j++){
          let y = j / count;
          y = y * width - (width / 2.0);
          pPos.push(-x, -y, 0.0);
          pCol.push(i / count, j / count, 0.5, 1.0);
        }
      }
      {
        const iRad = (i / count) * Math.PI * 2.0;
        const x = Math.sin(iRad);
        const z = Math.cos(iRad);
        for(let j = 0; j < count; j++){
          const jRad = j / count * Math.PI;
          const r = Math.sin(jRad);
          const y = Math.cos(jRad);
          sPos.push(x * radius * r, y * radius, z * radius * r);
          sCol.push(0.5, i / count, j / count, 1.0);
        }
      }
    }
    return {
      planePosition: pPos,
      planeColor: pCol,
      spherePosition: sPos,
      sphereColor: sCol,
    }
   }

   // 4つの丸い形状を持つジオメトリ
   roundShapes(vertexCount, vertexRadius, vertexColor){
    const circlePos   = [];
    const circleCol   = [];
    const diskPos     = [];
    const diskCol     = [];
    const cylinderPos = [];
    const cylinderCol = [];
    const spherePos   = [];
    const sphereCol   = [];
    for(let i = 0; i <= vertexCount; i++){
      // 円
      {
        for(let j = 0; j <= vertexCount; j++){
          const r = Math.PI * 2 / vertexCount * j;
          const rx = Math.cos(r);
          const ry = Math.sin(r);
          circlePos.push(rx * vertexRadius, ry * vertexRadius, 0.0);
          circleCol.push(vertexColor[0], vertexColor[1], vertexColor[2], vertexColor[3]);
        }
      }
      // 円板
      {
        let r = (i % 10) * 0.1;
        for(let j = 0; j <= vertexCount; j++){
          const rad = Math.PI * 2.0 / vertexCount * j;
          const rx = Math.cos(rad)* vertexRadius * r;
          const ry = Math.sin(rad)* vertexRadius * r;
          diskPos.push(rx, ry, 0.0);
          diskCol.push(vertexColor[0], vertexColor[1], vertexColor[2], vertexColor[3]);
        }
      }
      // 円筒
      {
        let   r    = (i%10) * 0.1;
        const rrr  = (vertexCount/10 - 1) * 0.1;
        // const hr   = headRadius;
        const hr   = 0.5;
        // const rr   = rodRadius;
        const rr   = 0.5;
        const h = 1.0 / 2;
        for(let j = 0; j <= vertexCount; j++){
          const radian = Math.PI * 2.0 / vertexCount * j;
          const x      = Math.cos(radian);
          const y      = Math.sin(radian);
          // シリンダーの head 部分
          cylinderPos.push(
            x * hr * r, y * hr * r,  h, // 天面
            x * rr * rrr, y * rr * rrr, ((h / (vertexCount/10)) * (i%10)), // 天面側のrod部分
            x * rr * rrr, y * rr * rrr, ((-h / (vertexCount/10)) * (i%10)), // 底面側のrod部分
            x * hr * r, y * hr * r, -h, // 底面
          );
          cylinderCol.push(
            vertexColor[0], vertexColor[1], vertexColor[2], vertexColor[3],
            vertexColor[0], vertexColor[1], vertexColor[2], vertexColor[3],
            vertexColor[0], vertexColor[1], vertexColor[2], vertexColor[3],
            vertexColor[0], vertexColor[1], vertexColor[2], vertexColor[3],
          );
        }
      }
      // 球体
      {
        const lat = Math.PI / vertexCount * i;
        const latX = Math.sin(lat);
        const latY = Math.cos(lat);
        for(let j = 0; j <= vertexCount; j++){
          const lon = Math.PI * 2 / vertexCount * j;
          const lonX = Math.cos(lon);
          const lonZ = Math.sin(lon);
          spherePos.push(
            latX * vertexRadius * lonX,
            latY * vertexRadius,
            latX * vertexRadius * lonZ,
          );
          sphereCol.push(vertexColor[0], vertexColor[1], vertexColor[2], vertexColor[3]);
        }
      }
    }
    return {
      circlePosition: circlePos,
      circleColor: circleCol,
      diskPosition: diskPos,
      diskColor: diskCol,
      cylinderPosition: cylinderPos,
      cylinderColor: cylinderCol,
      spherePosition: spherePos,
      sphereColor: sphereCol,
    }
   }
}