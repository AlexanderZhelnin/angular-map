import { ILayer } from './gr-kernal/models/draw-model';
import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { filter, fromEvent, map, switchMap } from 'rxjs';
import { SatWorkerService } from 'sat-worker';
import { build } from './gr-kernal/drawer';
import { FillStyleEnum, GrTypeEnum, ILegend } from './gr-kernal/models/legenda-model';
import { IRect } from './gr-kernal/models/rect-model';
import { scale2Mashtab } from './gr-kernal/calc';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit
{

  @ViewChild('canvas', { static: false }) canvas!: ElementRef
  private ctx!: CanvasRenderingContext2D;
  private center!: { x: number, y: number };
  private scale = 4;
  private mashtab = 1;
  ls: ILegend[] = [];
  dl = new Map<number, ILegend>();

  constructor(private httpClient: HttpClient, private s_worker: SatWorkerService)
  {

  }


  ngAfterViewInit(): void
  {
    this.canvas.nativeElement.height = 1000;
    this.canvas.nativeElement.width = 1000;
    this.ctx = this.canvas.nativeElement.getContext('2d');

    const mapRect: IRect = { left: 1200, bottom: 100, right: 4000, top: 2800 };
    this.center = { x: (mapRect.right + mapRect.left) / 2, y: (mapRect.top + mapRect.bottom) / 2 };

    const scaleX = this.canvas.nativeElement.width / (mapRect.right - mapRect.left);
    const scaleY = this.canvas.nativeElement.height / (mapRect.top - mapRect.bottom);
    this.scale = scaleX > scaleY
      ? scaleY
      : scaleX;
    this.mashtab = 100;//scale2Mashtab(this.scale);

    console.time('load json');
    this.httpClient.get<ILegend[]>('/assets/primitives.json').subscribe({
      next: gs =>
      {
        console.timeEnd('load json');
        gs.sort((leg1, leg2) =>
        {
          if ((leg1?.priority ?? 0) < (leg2?.priority ?? 0)) return -1;
          if ((leg1?.priority ?? 0) > (leg2?.priority ?? 0)) return 1;
          return 0;
        });
        this.ls = gs;

        this.dl = gs.reduce((m, l) => m.set(l.id, l), new Map<number, ILegend>());


        fromEvent(this.canvas.nativeElement, 'mousedown')
          .pipe(
            map(me => me as MouseEvent),
            filter(me => me.buttons === 1),
            map(me => { return { x: me.x, y: me.y } }),
            switchMap(position =>
            {
              const center = { ...this.center };
              return fromEvent(this.canvas.nativeElement, 'mousemove')
                .pipe(
                  map(me => me as MouseEvent),
                  filter(me => me.buttons === 1),
                  map((me: any) => { return { position, center, x: me.x, y: me.y }; })
                );
            }))
          .subscribe({
            next: arg =>
            {
              const dx = arg.x - arg.position.x;
              const dy = arg.y - arg.position.y;
              this.center = {
                x: arg.center.x - dx / this.scale,
                y: arg.center.y + dy / this.scale
              }

              this.drawAll(this.ls);
            }
          });

        //fromEvent(this.canvas.nativeElement, 'mousedown').subscribe({next: me=>console.log(me)});

        fromEvent(this.canvas.nativeElement, 'mousedown')
          .pipe(
            map(me => me as MouseEvent),
            filter(me => me.buttons === 4),
            map(me => { return { x: me.x, y: me.y } }),
            switchMap(position =>
            {
              //const center = { ...this.center };
              return fromEvent(this.canvas.nativeElement, 'mousemove')
                .pipe(
                  map(me => me as MouseEvent),
                  filter(me => me.buttons === 4),

                  map((me: any) =>
                  {
                    const deltaY = me.y - position.y;
                    position = { x: me.x, y: me.y };
                    return Math.exp(deltaY / 100);
                  })
                );
            }))
          .subscribe({
            next: dY =>
            {
              this.scale /= dY;
              this.drawAll(this.ls);
            }
          });

        fromEvent(this.canvas.nativeElement, 'mousewheel')
          .subscribe({
            next: (me: any) =>
            {
              const delta = me.deltaY || me.detail || me.wheelDelta;

              this.scale *= (delta > 0) ? 0.9 : 1.1;
              this.mashtab = scale2Mashtab(this.scale);
              this.drawAll(gs);
            }
          });


        this.drawAll(this.ls);
      }
    });
  }


  drawAll(ls: ILegend[]): void
  {
    const w2 = (this.canvas.nativeElement.width / this.scale) / 2;
    const h2 = (this.canvas.nativeElement.height / this.scale) / 2;

    const rect: IRect =
    {
      left: this.center.x - w2,
      bottom: this.center.y - h2,
      right: this.center.x + w2,
      top: this.center.y + h2
    };

    const layers = build(this.ctx, ls, { left: rect.left, top: rect.top, scale: this.scale, mashtab: this.mashtab }, rect);

    this.draw(layers);


    //console.timeEnd('draw');
    //ctx.stroke();

    //ctx1.drawImage(offscreenCanvas, 0, 0);

    // for (const l of ls)
    //   draw(l, { left, top, scale, mashtab: 20000 }, { left, bottom, right, top }, ctx as CanvasRenderingContext2D);


    // this.s_worker.work((arg: { gs: IPrimitive[], scale: number, left: number, bottom: number }): IPrimitive[] =>
    // {
    //   const result: IPrimitive[] = [];

    //   arg.gs.forEach(g =>
    //     result.push({
    //       name: g.name,
    //       rect: g.rect,
    //       type: g.type,
    //       coords: g.coords
    //         .map(c =>
    //         {
    //           return { x: (c.x - arg.left) * arg.scale, y: 1000 - (c.y - arg.bottom) * arg.scale };
    //         })
    //     }
    //     ));

    //   return result;
    // },
    //   { gs, scale: scale, left, bottom })
    //   .subscribe({
    //     next: gss =>
    //     {
    //       gss.forEach(g =>
    //       {
    //         ctx?.moveTo(g.coords[0].x, g.coords[0].y);
    //         for (let i = 1; i < g.coords.length; i++)
    //           ctx?.lineTo(g.coords[i].x, g.coords[i].y);

    //         if (g.type == GrTypeEnum.polygon)
    //           ctx?.lineTo(g.coords[0].x, g.coords[0].y);
    //       });
    //       ctx?.stroke();
    //       console.timeEnd('draw');

    //       this.draw(gs);
    //     }
    //   });
  }

  private draw(layers: ILayer[])
  {
    const t0 = performance.now();
    const ctx = this.ctx;

    ctx.clearRect(0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height);

    for (const l of layers)
    {
      const leg = this.dl.get(l.legendId);
      if (!leg) continue;

      //if (leg.border.style === BorderStyleEnum.Solid)

      if (!leg.border.scaled)
        ctx.lineWidth = leg.border.size;
      else
        ctx.lineWidth = leg.border.size * this.scale;


      ctx.lineCap = "round";//"butt" || "round" || "square";


      switch (leg.type)
      {
        case GrTypeEnum.Line:

          //if (leg.border.style === BorderStyleEnum.Solid)
          ctx.strokeStyle = leg.border.color;
          for (const cs of l.coords)
          {
            ctx.beginPath();

            ctx.moveTo(cs[0], cs[1]);
            for (let i = 2; i < cs.length; i += 2)
              ctx.lineTo(cs[i], cs[i + 1]);

            //ctx.closePath();
            ctx.stroke();
          }
          break;
        case GrTypeEnum.Polygon:

          if (leg.fill.style === FillStyleEnum.Solid)
          {
            ctx.fillStyle = leg.fill.color1;
            for (const cs of l.coords)
            {
              ctx.beginPath();
              ctx.moveTo(cs[0], cs[1]);
              for (let i = 2; i < cs.length; i += 2)
                ctx.lineTo(cs[i], cs[i + 1]);

              ctx.lineTo(cs[0], cs[1]);

              //ctx.closePath();
              ctx.fill();
            }

          }

          // if (leg.border.style === BorderStyleEnum.Solid)
          // {
          for (const cs of l.coords)
          {
            ctx.beginPath();
            ctx.moveTo(cs[0], cs[1]);
            for (let i = 2; i < cs.length; i += 2)
              ctx.lineTo(cs[i], cs[i + 1]);
            ctx.lineTo(cs[0], cs[1]);
            ctx.closePath();
            ctx.stroke();
          }

          // }

          break;
      }
    }

    for (const l of layers)
    {
      const leg = this.dl.get(l.legendId);
      if (!leg) continue;

      ctx.font = l.font;

      for (const txt of l.texts)
      {
        if (txt.angle)
        {
          ctx.save();
          ctx.fillStyle = leg.text.color;
          ctx.translate(txt.x, txt.y);
          ctx.rotate(-txt.angle);
          ctx.fillText(txt.text, 0, 0);
          ctx.restore();

        }
        else
        {
          ctx.save();
          ctx.fillStyle = leg.text.color;
          ctx.fillText(txt.text, txt.x, txt.y);
          ctx.restore();
        }


        // ctx.moveTo(txt.coords[0], txt.coords[1]);
        // for (let i = 2; i < txt.coords.length; i += 2)
        //   ctx.lineTo(txt.coords[i], txt.coords[i + 1])

        // ctx.lineTo(txt.coords[0], txt.coords[1])

        // ctx.moveTo(txt.rect.left, txt.rect.bottom);
        // ctx.lineTo(txt.rect.right, txt.rect.bottom);
        // ctx.lineTo(txt.rect.right, txt.rect.top);
        // ctx.lineTo(txt.rect.left, txt.rect.top);
        // ctx.lineTo(txt.rect.left, txt.rect.bottom);


        // ctx.stroke();

      }
    }

    const t1 = performance.now();
    const t = (t1 - t0);
    console.log(`${t} ms отрисовка`);
  }

  test()
  {
    const w2 = (this.canvas.nativeElement.width / this.scale) / 2;
    const h2 = (this.canvas.nativeElement.height / this.scale) / 2;

    const rect: IRect =
    {
      left: this.center.x - w2,
      bottom: this.center.y - h2,
      right: this.center.x + w2,
      top: this.center.y + h2
    };


    // let i = 0
    let t = 0;

    // const int = setInterval(() =>
    // {
    const t0 = performance.now();
    //for (let i = 0; i < 100; i++)
    //{
    const layers = build(this.ctx, this.ls, { left: rect.left, top: rect.top, scale: this.scale, mashtab: this.mashtab }, rect);

    build(this.ctx, this.ls,
      { left: rect.left, top: this.center.y, scale: this.scale / 2, mashtab: this.mashtab },
      { left: rect.left, bottom: rect.bottom, right: this.center.x, top: this.center.y });

    build(this.ctx, this.ls,
      { left: this.center.x, top: this.center.y, scale: this.scale / 2, mashtab: this.mashtab },
      { left: this.center.x, bottom: rect.bottom, right: rect.right, top: this.center.y });

    build(this.ctx, this.ls,
      { left: rect.left, top: rect.top, scale: this.scale / 2, mashtab: this.mashtab },
      { left: rect.left, bottom: this.center.y, right: this.center.x, top: rect.top });

    build(this.ctx, this.ls,
      { left: this.center.x, top: rect.top, scale: this.scale / 2, mashtab: this.mashtab },
      { left: this.center.x, bottom: this.center.y, right: rect.right, top: rect.top });

    //}
    const t1 = performance.now();
    t += (t1 - t0);
    console.log(`${t} ms обработка данных`);

    this.draw(layers);
  }
}
