import { ILegend } from "./legenda-model";
import { IRect } from "./rect-model";

/** Единицы измерения */
export enum EdIzmEnum
{
  Метр = 0,
  Сантиметр = 1,
  Миллиметр = 2,
  Пиксель = 3
}
/** Система координат */
export enum CoordSysEnum
{
  Декартовая = 0,
  Декартовая3D = 1,
  Меркатор = 2,
  Меркатор3D = 4,
  Слайд = 3,
}

/** Карта/схема */
export interface IMap
{
  /** Уникальный идентификатор карты */
  id: BigInt;
  // objectId: BigInt;
  /** Имя */
  name: string;
  /** Описывающий прямоугольник */
  rect: IRect;
  /** Цвет фона */
  backColor: string;
  /** Единицы измерения */
  edIzm: EdIzmEnum;
  /** Система координат */
  coordSys: CoordSysEnum;
  /** Легенды */
  legends: ILegend[];
}
