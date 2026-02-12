import { Router } from 'express';
import { z } from 'zod';
import { optionalAuth } from '../middleware/auth.js';
import { validateQuery } from '../middleware/validate.js';
import { readRateLimit } from '../middleware/rateLimit.js';
import { weatherService } from '../services/weatherService.js';
import type { Request, Response } from 'express';

const router = Router();

const weatherQuerySchema = z.object({
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
});

const forecastQuerySchema = z.object({
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  days: z.coerce.number().min(1).max(7).optional().default(5),
});

/**
 * @openapi
 * /api/weather:
 *   get:
 *     tags:
 *       - Weather
 *     summary: Get current weather for a location
 *     description: |
 *       Returns current weather conditions and a playability score (1-10)
 *       for golf at the specified location.
 *     parameters:
 *       - in: query
 *         name: latitude
 *         required: true
 *         schema:
 *           type: number
 *           minimum: -90
 *           maximum: 90
 *         description: Latitude of the location
 *         example: 37.7749
 *       - in: query
 *         name: longitude
 *         required: true
 *         schema:
 *           type: number
 *           minimum: -180
 *           maximum: 180
 *         description: Longitude of the location
 *         example: -122.4194
 *     responses:
 *       200:
 *         description: Weather data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     temperature:
 *                       type: number
 *                       description: Temperature in Fahrenheit
 *                       example: 72
 *                     feelsLike:
 *                       type: number
 *                       example: 70
 *                     humidity:
 *                       type: number
 *                       example: 55
 *                     windSpeed:
 *                       type: number
 *                       description: Wind speed in mph
 *                       example: 8
 *                     windDirection:
 *                       type: string
 *                       example: "NW"
 *                     conditions:
 *                       type: string
 *                       example: "Partly Cloudy"
 *                     icon:
 *                       type: string
 *                       example: "cloud"
 *                     playabilityScore:
 *                       type: number
 *                       description: Golf playability score (1-10)
 *                       example: 8
 *                     alerts:
 *                       type: array
 *                       items:
 *                         type: string
 */
router.get(
  '/',
  optionalAuth,
  readRateLimit,
  validateQuery(weatherQuerySchema),
  async (req: Request, res: Response) => {
    const { latitude, longitude } = req.query as unknown as z.infer<typeof weatherQuerySchema>;

    const weather = await weatherService.getCurrentWeather(latitude, longitude);

    res.json({
      success: true,
      data: weather,
    });
  }
);

/**
 * @openapi
 * /api/weather/forecast:
 *   get:
 *     tags:
 *       - Weather
 *     summary: Get weather forecast for a location
 *     description: |
 *       Returns a multi-day weather forecast with playability scores
 *       for golf planning.
 *     parameters:
 *       - in: query
 *         name: latitude
 *         required: true
 *         schema:
 *           type: number
 *         description: Latitude of the location
 *       - in: query
 *         name: longitude
 *         required: true
 *         schema:
 *           type: number
 *         description: Longitude of the location
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 7
 *           default: 5
 *         description: Number of forecast days
 *     responses:
 *       200:
 *         description: Forecast data retrieved successfully
 */
router.get(
  '/forecast',
  optionalAuth,
  readRateLimit,
  validateQuery(forecastQuerySchema),
  async (req: Request, res: Response) => {
    const { latitude, longitude, days } = req.query as unknown as z.infer<typeof forecastQuerySchema>;

    const forecast = await weatherService.getForecast(latitude, longitude, days);

    res.json({
      success: true,
      data: forecast,
    });
  }
);

export { router as weatherRoutes };
