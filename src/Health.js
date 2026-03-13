const express = require('express');
const mongoose = require('mongoose');
const os = require('os');
const router = express.Router();

router.get('/health', async (req, res) => {
  try {
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    const startTime = Date.now();

    let dbResponseTime = null;
    if (dbStatus === 'connected') {
      try {
        const pingStart = Date.now();
        await mongoose.connection.db.admin().ping();
        dbResponseTime = Date.now() - pingStart;
      } catch (err) {
        dbResponseTime = null;
      }
    }

    const healthData = {
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: {
        process: Math.floor(process.uptime()),
        system: Math.floor(os.uptime())
      },
      environment: process.env.NODE_ENV || 'development',
      database: {
        status: dbStatus,
        name: mongoose.connection.name,
        responseTime: dbResponseTime ? `${dbResponseTime}ms` : null
      },
      memory: {
        process: {
          heapUsed: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
          heapTotal: `${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)}MB`,
          rss: `${Math.round(process.memoryUsage().rss / 1024 / 1024)}MB`
        },
        system: {
          free: `${Math.round(os.freemem() / 1024 / 1024)}MB`,
          total: `${Math.round(os.totalmem() / 1024 / 1024)}MB`,
          usagePercent: Math.round(((os.totalmem() - os.freemem()) / os.totalmem()) * 100)
        }
      },
      cpu: {
        cores: os.cpus().length,
        loadAverage: os.loadavg().map(avg => avg.toFixed(2))
      },
      node: {
        version: process.version
      },
      responseTime: `${Date.now() - startTime}ms`
    };

    if (dbStatus === 'disconnected') {
      return res.status(503).json({
        ...healthData,
        status: 'UNHEALTHY'
      });
    }

    res.status(200).json(healthData);
  } catch (error) {
    res.status(503).json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

module.exports = router;
