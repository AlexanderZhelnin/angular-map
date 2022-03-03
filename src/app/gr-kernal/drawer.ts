import { IDrawProperties, ILayer, IObraz, IText } from './models/draw-model';
import { GrTypeEnum, ILegend } from './models/legenda-model';
import { IRect } from './models/rect-model';
import { clipPolygon } from './primetives/polygon/polygon';
import { clipPolyline } from './primetives/polyline/polyline';
import { calcText, optimizeTexts } from './primetives/text/text';
import { mashtab2Scale, optimize, translate, translateText } from './calc';


/** Преобразование примитивов с учётом отсечения */
export function* clipPrimitives(measureText: (l: ILegend, text: string) => [w: number, h: number], l: ILegend, pr: IDrawProperties, rect: IRect): Generator<IObraz>
{
  for (const g of l.primitives)
  {
    if (g.rect.left >= rect.left && g.rect.bottom >= rect.bottom && g.rect.right <= rect.right && g.rect.top <= rect.top)
      // Целиком лежит внутри прямоугольника
      yield { coords: [...g.coords], text: calcText(measureText, g.name, l, g.coords, pr) };
    else if (g.rect.left < rect.right && g.rect.bottom < rect.top && g.rect.right > rect.left && g.rect.top > rect.bottom)
      // Необходимо отсекать
      switch (l.type)
      {
        case GrTypeEnum.Line:
          for (const cs of clipPolyline(g, rect))
            yield { coords: cs, text: calcText(measureText, g.name, l, cs, pr) };
          break;
        case GrTypeEnum.Polygon:
          let cs = clipPolygon(g, rect);
          if (cs.length > 0)
            yield { coords: cs, text: calcText(measureText, g.name, l, cs, pr) };
          break;
      }
  }
}

// let savectx: CanvasRenderingContext2D;
// //measureText: (l: ILegend, text: string) => [w: number, h: number]
// const measureText = (l: ILegend, text: string): [w: number, h: number] =>
// {

//   const mText = ctx.measureText(text);
//   //let fontHeight = mText.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent;

//   return [mText.width, (mText.actualBoundingBoxAscent + mText.actualBoundingBoxDescent)];
// }

function measureText(ctx: CanvasRenderingContext2D): (l: ILegend, text: string) => [w: number, h: number]
{
  let d = new Map<string, [w: number, h: number]>();
  let lastLegend: ILegend | undefined = undefined;
  return (l: ILegend, text: string): [w: number, h: number] =>
  {
    if (lastLegend?.id === l.id)
    {
      const size = d.get(text);
      if (!!size) return size;
    }
    else
    {
      lastLegend = l;
      d = new Map<string, [w: number, h: number]>();
    }
    const mText = ctx.measureText(text);
    //let fontHeight = mText.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent;

    const result: [w: number, h: number] = [mText.width, (mText.actualBoundingBoxAscent + mText.actualBoundingBoxDescent)];
    d.set(text, result);
    return result;
  }
}


/** Подготовка данных для отрисовки */
export function build(ctx: CanvasRenderingContext2D, ls: ILegend[], pr: IDrawProperties, rect: IRect): ILayer[]
{
  const fMeasureText = measureText(ctx);
  const result: ILayer[] = [];

  for (const l of ls)
  {
    let size = l.text.font.size;
    if (l.text.scaled)
      size *= pr.scale / mashtab2Scale(l.text.mashtabBase);

    ctx.font = `${size}pt ${l.text.font.family}`;

    const mas: number[][] = [];
    const texts: IText[] = [];

    result.push({ legendId: l.id, coords: mas, texts, font: ctx.font });
    if (l.mashtabRange.min > pr.mashtab || l.mashtabRange.max < pr.mashtab) continue;
    for (const obraz of clipPrimitives(fMeasureText, l, pr, rect))
    {
      const csOpt = optimize(obraz.coords, 1 / pr.scale);
      translate(csOpt, pr);
      mas.push(csOpt);

      if (!obraz.text) continue;
      texts.push(obraz.text);
      translateText(obraz.text, pr);
    }
  }

  optimizeTexts(result);
  return result;
}
