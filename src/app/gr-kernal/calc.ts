import { IDrawProperties, IText } from "./models/draw-model";
import { IRect } from "./models/rect-model";

/** Преобразование в систему координат экрана */
export function translate(cs: number[], pr: IDrawProperties)
{
  for (let i = 0; i < cs.length; i += 2)
  {
    cs[i] = (cs[i] - pr.left) * pr.scale;
    cs[i + 1] = (pr.top - cs[i + 1]) * pr.scale;
  }
}

/** Преобразование в систему координат экрана для описывающего прямоугольника */
export function translateRect(r: IRect, pr: IDrawProperties)
{
  r.left = (r.left - pr.left) * pr.scale;
  r.right = (r.right - pr.left) * pr.scale;

  r.bottom = (pr.top - r.bottom) * pr.scale;
  r.top = (pr.top - r.top) * pr.scale;
}

/** Преобразование в систему координат экрана для текста */
export function translateText(txt: IText, pr: IDrawProperties)
{
  translate(txt.coords, pr);
  translateRect(txt.rect, pr);
  txt.x = (txt.x - pr.left) * pr.scale;
  txt.y = (pr.top - txt.y) * pr.scale;
}

/** Вычислить описывающий прямоугольник для координат */
export function calcRect(coords: number[]): IRect
{

  let left = coords[0];
  let bottom = coords[1];

  let right = coords[0];
  let top = coords[1];

  for (let i = 2; i < coords.length; i += 2)
  {
    const x = coords[i];
    const y = coords[i + 1];

    if (left > x) left = x;
    if (bottom > y) bottom = y;

    if (right < x) right = x;
    if (top < y) top = y;

  }

  return { left, bottom, right, top };
}

/** Вычислить максимальный отрезок */
export function calcMaxLen(coords: number[]): number
{
  let result = 0;
  let x1 = coords[0];
  let y1 = coords[1];
  let max = 0;


  for (let i = 2; i < coords.length; i += 2)
  {

    let x2 = coords[i];
    let y2 = coords[i + 1];

    const dx = x2 - x1;
    const dy = y2 - y1;

    const l = Math.sqrt(dx * dx + dy * dy);
    if (max < l)
    {
      max = l;
      result = i - 2;
    }

  }

  return result;
}

/** Удаление точек которые не будут отображаться */
export function optimize(mas: number[], l: number = 1): number[]
{
  const count = mas.length;
  if (count < 60) return mas;

  const coords: number[] = [];
  let lastCoordX1 = mas[0];
  let lastCoordY1 = mas[1];
  let lastCoordX2 = mas[2];
  let lastCoordY2 = mas[3];
  coords.push(lastCoordX1);
  coords.push(lastCoordY1);

  for (let i = 4; i < count; i += 2)
    if (!isPointOnLine(lastCoordX1, lastCoordY1, lastCoordX2, lastCoordY2, mas[i], mas[i + 1], l))
    {
      lastCoordX1 = mas[i - 2];
      lastCoordY1 = mas[i - 1];

      lastCoordX2 = mas[i];
      lastCoordY2 = mas[i + 1];
      coords.push(lastCoordX1);
      coords.push(lastCoordY1);
    }

  coords.push(mas[count - 2]);
  coords.push(mas[count - 1]);

  return coords;
}

/** Находится ли следующая точка на линии с определённым допуском */
export function isPointOnLine(pX1: number, pY1: number, pX2: number, pY2: number, pX3: number, pY3: number, l: number): boolean
{
  if ((pX3 === pX1 && pX3 === pY1) || (pX3 === pX1 && pX3 === pY1))
    return true;

  let aX = pX2 - pX1;
  let aY = pY2 - pY1;
  // вектор повёрнутый на 90
  let pX4 = -aY + pX3;
  let pY4 = aX + pY3;

  let retX = 0;
  let retY = 0;
  if (pX2 === pX1)
  {
    retX = pX1;
    if (pY4 === pY3)
      retY = pY3;
    else if (pX4 !== pX3)
      retY = (pX1 - pX3) * (pY4 - pY3) / (pX4 - pX3) + pY3;
    else
    {
      //console.log('');
    }
  }
  else if (pY2 === pY1)
  {
    retY = pY1;
    if (pX4 === pX3)
      retX = pX3;
    else if (pY4 !== pY3)
      retX = (pY1 - pY3) * (pX4 - pX3) / (pY4 - pY3) + pX3;
    else
    {
      //console.log('');
    }
  }
  else if (pX4 === pX3)
  {
    retX = pX3;
    retY = (pX3 - pX1) * (pY2 - pY1) / (pX2 - pX1) + pY1;

  }
  else if (pY4 === pY3)
  {
    retY = pY3;
    retX = (pY3 - pY1) * (pX2 - pX1) / (pY2 - pY1) + pX1;

  }
  else
  {
    var k1 = (pY2 - pY1) / (pX2 - pX1);
    var k2 = (pY4 - pY3) / (pX4 - pX3);

    retX = (k1 * pX1 - k2 * pX3 + pY3 - pY1) / (k1 - k2);
    retY = (retX - pX1) * k1 + pY1;
  }

  retX -= pX3;
  retY -= pY3;


  return Math.sqrt(retX * retX + retY * retY) < l;

}

/** Преобразование из коэффициента в масштаб */
export function scale2Mashtab(scale: number): number
{
  return (144 * 1000 / 25.4) / scale;
}

/** Преобразование из масштаба в коэффициент */
export function mashtab2Scale(scale: number): number
{
  return scale * (144 * 1000 / 25.4);
}
