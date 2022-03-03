import { IDrawProperties, ILayer, IText } from "../../models/draw-model";
import { GrTypeEnum, ILegend } from "../../models/legenda-model";
import { calcMaxLen, calcRect } from "../../calc";

/** Расчёт данных для отображения текста */
export function calcText(measureText: (l: ILegend, text: string) => [w: number, h: number], text: string, l: ILegend, coords: number[], pr: IDrawProperties): IText | undefined
{
  if (!text.trim()) return undefined;
  if (l.text.mashtabRange.min > pr.mashtab || l.text.mashtabRange.max < pr.mashtab) return undefined;
  if (l.text.color === 'rgba(0, 0, 0, 0)') return undefined;

  let [w, h] = measureText(l, text);
  w /= pr.scale;
  h /= pr.scale;

  switch (l.type)
  {
    case GrTypeEnum.Polygon:
      {
        const rect = calcRect(coords);
        const x = (rect.left + rect.right) / 2 - w / 2;
        const y = (rect.bottom + rect.top) / 2 - h / 2;
        const tCoords = [x, y, x + w, y, x + w, y + h, x, y + h];
        return { text, x, y, angle: 0, rect: calcRect(tCoords), coords: tCoords };
      }

    case GrTypeEnum.Line:
      {
        const maxI = calcMaxLen(coords);

        let x1 = coords[maxI];
        let y1 = coords[maxI + 1];
        let x2 = coords[maxI + 2];
        let y2 = coords[maxI + 3];

        let cx = (x1 + x2) / 2;
        let cy = (y1 + y2) / 2;


        let dx = x2 - x1;
        let dy = y2 - y1;

        let angle = Math.atan2(dy, dx);

        // что бы надпись не была к верх ногами
        if (x1 > x2)
        {
          angle += Math.PI;

          x2 = coords[maxI];
          y2 = coords[maxI + 1];
          x1 = coords[maxI + 2];
          y1 = coords[maxI + 3];

          dx = -dx;
          dy = -dy;
        }

        // вектор единичной длинны
        let wX = Math.cos(angle);
        let wY = Math.sin(angle);

        cx -= (w * wX - wY * h) / 2;
        cy -= (w * wY + wX * h) / 2;

        const tCoords = [
          cx, cy,
          cx + w * wX, cy + w * wY,
          cx + w * wX - wY * h, cy + w * wY + wX * h,
          cx - wY * h, cy + wX * h];

        return {
          text, x: cx, y: cy, angle, rect: calcRect(tCoords),
          coords: tCoords
        };
      }
  }

  return undefined;
}


/** Оптимизация вывода текстов, убрать пересечение */
export function optimizeTexts(result: ILayer[])
{
  const dText: IText[] = [];
  for (let l = result.length - 1; l >= 0; l--)
  {
    const texts = result[l].texts;
    for (let i = texts.length - 1; i >= 0; i--)
    {
      const txt = texts[i];
      const rt = txt.rect;

      let fined = false;
      for (const dt of dText)
        if (rt.left < dt.rect.right &&
          rt.right > dt.rect.left &&
          rt.bottom > dt.rect.top &&
          rt.top < dt.rect.bottom)
        {
          texts.splice(i, 1);
          fined = true;
          break;
        }

      if (!fined) dText.push(txt);
    }
  }
}
