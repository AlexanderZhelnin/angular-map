import { IRect } from "./rect-model";

/** Приметив графического образа */
export interface IPrimitive
{
  /** Координаты приметива  */
  coords: number[];
  textCoordX: number;
  textCoordY: number;
  /** Угол поворота */
  textAngle: number;
  /** Описывающий прямоугольник */
  rect: IRect;
  /** Имя */
  name: string
}
