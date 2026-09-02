#!/usr/bin/env ts-node
/**
 * CBS Business Coverage CLI
 * Run: npm run coverage:business
 */
import { CoverageDashboard } from './CoverageDashboard';

const dashboard = new CoverageDashboard();
dashboard.run();
