import { NextFunction, Response } from 'express';
import { Request } from 'express';
import { StatusCodes } from 'http-status-codes';
import { RelatoriosService } from '../services/relatorios.service';

export class RelatoriosController {
  constructor(private relatoriosService: RelatoriosService) {}

  porCulto = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const churchId = req.auth!.churchId;
      const cultoId = req.params.cultoId;
      const result = await this.relatoriosService.porCulto(
        { cultoId },
        churchId,
      );
      res.status(StatusCodes.OK).json(result);
    } catch (err) {
      next(err);
    }
  };

  porPeriodo = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const churchId = req.auth!.churchId;
      const { beginDate, endDate } = req.query as {
        beginDate: string;
        endDate: string;
      };
      const result = await this.relatoriosService.porPeriodo(
        {
          beginDate: new Date(beginDate),
          endDate: new Date(endDate),
        },
        churchId,
      );
      res.status(StatusCodes.OK).json(result);
    } catch (err) {
      next(err);
    }
  };

  anual = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const churchId = req.auth!.churchId;
      const { year } = req.query as { year: string };
      const result = await this.relatoriosService.anual({ year }, churchId);
      res.status(StatusCodes.OK).json(result);
    } catch (err) {
      next(err);
    }
  };
}
