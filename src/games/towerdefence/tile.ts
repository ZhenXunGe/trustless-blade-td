const tileWidth = 60;
const tileHeight = 60;
const width = 12;
const height = 8;

import Spirites from "./spirite";

function rect(x: number, y: number, color: string, context: CanvasRenderingContext2D) {
        context.beginPath();
        const xd = tileWidth/2;
        const yd = tileHeight/2;
        /*
        context.fillStyle = color;
        context.lineTo(x - xd, y - yd);
        context.lineTo(x + xd, y - yd);
        context.lineTo(x + xd, y + yd);
        context.lineTo(x - xd, y + yd);
        context.stroke();
        */
}


function direction(x: number, y: number, direction: string, color: string, context: CanvasRenderingContext2D) {
        context.beginPath();
        const xd = tileWidth/2;
        const yd = tileHeight/2;
        context.fillStyle = color;
        context.lineTo(x - xd + 1, y - yd + 1);
        context.lineTo(x + xd - 1, y - yd + 1);
        context.lineTo(x + xd - 1, y + yd - 1);
        context.lineTo(x - xd + 1, y + yd - 1);
        context.fill();
        context.fillStyle = "white";
        context.fillText(direction, x-10, y);

}

function toX(xcor: number, ycor: number): number {
        return tileWidth * xcor + tileWidth/2;
}

function toY(xcor: number, ycor: number): number {
        return tileHeight/2 + tileHeight*ycor;
}

export function inGrid(x: number, y: number): boolean {
  return (x>0 && y>0 && x<tileWidth * width && y<tileHeight * height);
}

export function getCor(x: number, y: number): [number, number] {
  return [Math.floor(x/tileWidth), Math.floor(y/tileHeight)]
}

export function getTileIndex(x: number, y: number): number {
  return x + y * width;
}

export function drawTiles(tiles: any) {
        //console.log("drawing Tiles");
        const c = document.getElementById("canvas")! as HTMLCanvasElement;
        const context = c.getContext("2d")!;
        context.clearRect(0, 0, c.width, c.height);
        for (let i = 0; i<width; i++) {
            for (let j = 0; j<height; j++) {
              rect(toX(i, j), toY(i, j), "gray", context)
              if (tiles[j * width + i].feature != null) {
                direction(toX(i, j), toY(i, j), tiles[j * width + i].feature, "gray", context)
              }
            }
        }
}

function shift(x:number, y:number, direction: string, frame: number): {x: number, y:number} {
  let xx = x;
  let yy = y;
  switch (direction) {
    case "Bottom": {
      yy = yy + (tileHeight/12) * frame;
      break;
    }
    case "Top": {
      yy = yy - (tileHeight/12) * frame;
      break;
    }
    case "Left": {
      xx = xx - (tileWidth/12) * frame;
      break;
    }
    case "Right": {
      xx = xx + (tileWidth/12) * frame;
      break;
    }
  }
  return {x: xx, y: yy}
}

function drawObject(obj:any, tiles: Array<any>, context: CanvasRenderingContext2D, frame: number) {
        const x = toX(obj.position.x, obj.position.y);
        const y = toY(obj.position.x, obj.position.y);
        context.beginPath();
        const tile = tiles[obj.position.x + obj.position.y * width];
        switch (Object.keys(obj.object)[0]) {
          case "Monster": {
            const motion = shift(x,y,tile.feature, frame);
            context.fillStyle = "green";
            // fill hp range
            context.strokeRect(motion.x-5, motion.y-25, 10, 3);
            context.fillRect(motion.x-5, motion.y-25, obj.object.Monster.hp , 3);
            context.fillStyle = "orange";
            context.arc(motion.x, motion.y, 10, 0, 2 * Math.PI);
            context.fill();
            context.fillStyle = "white";
            context.fillText(frame.toString(), motion.x, motion.y+10);
            break;
          }
          case "Dropped": {
            context.fillStyle = "blue";
            const motion = shift(x,y,tile.feature, frame);
            context.arc(motion.x, motion.y, 13, 0, 2 * Math.PI);
            context.fill();
            context.fillStyle = "white";
            context.fillText(obj.object.Dropped.delta, motion.x, motion.y-10);
            break;
          }
          case "Tower": {
            context.fillStyle = "black";
            context.drawImage(Spirites.towerSpirites[0],
              0,
              0,
              Spirites.towerSpirites[0].width,
              Spirites.towerSpirites[0].height,
              x - tileWidth/2,
              y - tileHeight/2,
              tileWidth,
              tileHeight,
            );
            //context.arc(x, y, 15, 0, 2 * Math.PI);
            //context.fill();
            context.fillStyle = "white";
            context.fillText(obj.object.Tower.count, x, y-10);
            break;
          }
          case "Spawner": {
            context.fillStyle = "white";
            const spirites = Spirites.caveSpirites;
            context.drawImage(spirites[0],
              0,
              0,
              spirites[0].width,
              spirites[0].height,
              x - tileWidth/2,
              y - tileHeight/2,
              tileWidth,
              tileHeight,
            );
            //context.arc(x, y, 10, 0, 2 * Math.PI);
            //context.fill();
            break;
          }
          case "Collector": {
            context.fillStyle = "green";
            context.arc(x, y, 10, 0, 2 * Math.PI);
            context.fill();
            break;
          }
        }
}

export function drawObjects(map: {objects: Array<any>, tiles: Array<any>}, frame: number) {
        const objs = map.objects;
        const tiles = map.tiles;
        const c = document.getElementById("canvas")! as HTMLCanvasElement;
        const context = c.getContext("2d")!;
        for (const obj of objs) {
          drawObject(obj, tiles, context, frame);
        }
}


export function drawBullets(bullets: Array<any>, frame: number) {
        const c = document.getElementById("canvas")! as HTMLCanvasElement;
        const context = c.getContext("2d")!;
        for (const bullet of bullets) {
          const x1 = toX(bullet["Attack"][0][0], bullet["Attack"][0][1]);
          const y1 = toY(bullet["Attack"][0][0], bullet["Attack"][0][1]);
          const x2 = toX(bullet["Attack"][1][0], bullet["Attack"][1][1]);
          const y2 = toY(bullet["Attack"][1][0], bullet["Attack"][1][1]);
          const x = ((x2 * frame) + x1 * (12 - frame))/12;
          const y = ((y2 * frame) + y1 * (12 - frame))/12;
          context.beginPath();
          context.fillStyle = "yellow";
          context.arc(x, y, 3, 0, 2 * Math.PI);
          context.fill();
        }
}

