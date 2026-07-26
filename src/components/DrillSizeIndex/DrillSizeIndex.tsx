import React, { useState, useMemo } from 'react';
import { useUnit } from '../../context/UnitContext';

export interface DrillItem {
  id: string;
  name: string;
  category: 'Number' | 'Letter' | 'Fractional' | 'Metric';
  diameterIn: number;
  diameterMm: number;
}

// Comprehensive Drill Size Database (Number #107-#1, Letter A-Z, Fractional 1/64 - 1-1/2, Metric 0.05 - 38mm)
export const DRILL_DATABASE: DrillItem[] = [
  // Micro / Number Drills #107 down to #81
  { id: 'num-107', name: '#107', category: 'Number', diameterIn: 0.0019, diameterMm: 0.0483 },
  { id: 'num-106', name: '#106', category: 'Number', diameterIn: 0.0023, diameterMm: 0.0584 },
  { id: 'num-105', name: '#105', category: 'Number', diameterIn: 0.0027, diameterMm: 0.0686 },
  { id: 'num-104', name: '#104', category: 'Number', diameterIn: 0.0031, diameterMm: 0.0787 },
  { id: 'num-103', name: '#103', category: 'Number', diameterIn: 0.0035, diameterMm: 0.0889 },
  { id: 'num-102', name: '#102', category: 'Number', diameterIn: 0.0039, diameterMm: 0.0991 },
  { id: 'num-101', name: '#101', category: 'Number', diameterIn: 0.0043, diameterMm: 0.1092 },
  { id: 'num-100', name: '#100', category: 'Number', diameterIn: 0.0047, diameterMm: 0.1194 },
  { id: 'num-99', name: '#99', category: 'Number', diameterIn: 0.0051, diameterMm: 0.1295 },
  { id: 'num-98', name: '#98', category: 'Number', diameterIn: 0.0055, diameterMm: 0.1397 },
  { id: 'num-97', name: '#97', category: 'Number', diameterIn: 0.0059, diameterMm: 0.1499 },
  { id: 'num-96', name: '#96', category: 'Number', diameterIn: 0.0063, diameterMm: 0.1600 },
  { id: 'num-95', name: '#95', category: 'Number', diameterIn: 0.0067, diameterMm: 0.1702 },
  { id: 'num-94', name: '#94', category: 'Number', diameterIn: 0.0071, diameterMm: 0.1803 },
  { id: 'num-93', name: '#93', category: 'Number', diameterIn: 0.0075, diameterMm: 0.1905 },
  { id: 'num-92', name: '#92', category: 'Number', diameterIn: 0.0079, diameterMm: 0.2007 },
  { id: 'num-91', name: '#91', category: 'Number', diameterIn: 0.0083, diameterMm: 0.2108 },
  { id: 'num-90', name: '#90', category: 'Number', diameterIn: 0.0087, diameterMm: 0.2210 },
  { id: 'num-89', name: '#89', category: 'Number', diameterIn: 0.0091, diameterMm: 0.2311 },
  { id: 'num-88', name: '#88', category: 'Number', diameterIn: 0.0095, diameterMm: 0.2413 },
  { id: 'num-87', name: '#87', category: 'Number', diameterIn: 0.0100, diameterMm: 0.2540 },
  { id: 'num-86', name: '#86', category: 'Number', diameterIn: 0.0105, diameterMm: 0.2667 },
  { id: 'num-85', name: '#85', category: 'Number', diameterIn: 0.0110, diameterMm: 0.2794 },
  { id: 'num-84', name: '#84', category: 'Number', diameterIn: 0.0115, diameterMm: 0.2921 },
  { id: 'num-83', name: '#83', category: 'Number', diameterIn: 0.0120, diameterMm: 0.3048 },
  { id: 'num-82', name: '#82', category: 'Number', diameterIn: 0.0125, diameterMm: 0.3175 },
  { id: 'num-81', name: '#81', category: 'Number', diameterIn: 0.0130, diameterMm: 0.3302 },

  // Standard Number Drills #80 down to #1
  { id: 'num-80', name: '#80', category: 'Number', diameterIn: 0.0135, diameterMm: 0.3429 },
  { id: 'num-79', name: '#79', category: 'Number', diameterIn: 0.0145, diameterMm: 0.3683 },
  { id: 'num-78', name: '#78', category: 'Number', diameterIn: 0.0160, diameterMm: 0.4064 },
  { id: 'num-77', name: '#77', category: 'Number', diameterIn: 0.0180, diameterMm: 0.4572 },
  { id: 'num-76', name: '#76', category: 'Number', diameterIn: 0.0200, diameterMm: 0.5080 },
  { id: 'num-75', name: '#75', category: 'Number', diameterIn: 0.0210, diameterMm: 0.5334 },
  { id: 'num-74', name: '#74', category: 'Number', diameterIn: 0.0225, diameterMm: 0.5715 },
  { id: 'num-73', name: '#73', category: 'Number', diameterIn: 0.0240, diameterMm: 0.6096 },
  { id: 'num-72', name: '#72', category: 'Number', diameterIn: 0.0250, diameterMm: 0.6350 },
  { id: 'num-71', name: '#71', category: 'Number', diameterIn: 0.0260, diameterMm: 0.6604 },
  { id: 'num-70', name: '#70', category: 'Number', diameterIn: 0.0280, diameterMm: 0.7112 },
  { id: 'num-69', name: '#69', category: 'Number', diameterIn: 0.0292, diameterMm: 0.7417 },
  { id: 'num-68', name: '#68', category: 'Number', diameterIn: 0.0310, diameterMm: 0.7874 },
  { id: 'num-67', name: '#67', category: 'Number', diameterIn: 0.0320, diameterMm: 0.8128 },
  { id: 'num-66', name: '#66', category: 'Number', diameterIn: 0.0330, diameterMm: 0.8382 },
  { id: 'num-65', name: '#65', category: 'Number', diameterIn: 0.0350, diameterMm: 0.8890 },
  { id: 'num-64', name: '#64', category: 'Number', diameterIn: 0.0360, diameterMm: 0.9144 },
  { id: 'num-63', name: '#63', category: 'Number', diameterIn: 0.0370, diameterMm: 0.9398 },
  { id: 'num-62', name: '#62', category: 'Number', diameterIn: 0.0380, diameterMm: 0.9652 },
  { id: 'num-61', name: '#61', category: 'Number', diameterIn: 0.0390, diameterMm: 0.9906 },
  { id: 'num-60', name: '#60', category: 'Number', diameterIn: 0.0400, diameterMm: 1.0160 },
  { id: 'num-59', name: '#59', category: 'Number', diameterIn: 0.0410, diameterMm: 1.0414 },
  { id: 'num-58', name: '#58', category: 'Number', diameterIn: 0.0420, diameterMm: 1.0668 },
  { id: 'num-57', name: '#57', category: 'Number', diameterIn: 0.0430, diameterMm: 1.0922 },
  { id: 'num-56', name: '#56', category: 'Number', diameterIn: 0.0465, diameterMm: 1.1811 },
  { id: 'num-55', name: '#55', category: 'Number', diameterIn: 0.0520, diameterMm: 1.3208 },
  { id: 'num-54', name: '#54', category: 'Number', diameterIn: 0.0550, diameterMm: 1.3970 },
  { id: 'num-53', name: '#53', category: 'Number', diameterIn: 0.0595, diameterMm: 1.5113 },
  { id: 'num-52', name: '#52', category: 'Number', diameterIn: 0.0635, diameterMm: 1.6129 },
  { id: 'num-51', name: '#51', category: 'Number', diameterIn: 0.0670, diameterMm: 1.7018 },
  { id: 'num-50', name: '#50', category: 'Number', diameterIn: 0.0700, diameterMm: 1.7780 },
  { id: 'num-49', name: '#49', category: 'Number', diameterIn: 0.0730, diameterMm: 1.8542 },
  { id: 'num-48', name: '#48', category: 'Number', diameterIn: 0.0760, diameterMm: 1.9304 },
  { id: 'num-47', name: '#47', category: 'Number', diameterIn: 0.0785, diameterMm: 1.9939 },
  { id: 'num-46', name: '#46', category: 'Number', diameterIn: 0.0810, diameterMm: 2.0574 },
  { id: 'num-45', name: '#45', category: 'Number', diameterIn: 0.0820, diameterMm: 2.0828 },
  { id: 'num-44', name: '#44', category: 'Number', diameterIn: 0.0860, diameterMm: 2.1844 },
  { id: 'num-43', name: '#43', category: 'Number', diameterIn: 0.0890, diameterMm: 2.2606 },
  { id: 'num-42', name: '#42', category: 'Number', diameterIn: 0.0935, diameterMm: 2.3749 },
  { id: 'num-41', name: '#41', category: 'Number', diameterIn: 0.0960, diameterMm: 2.4384 },
  { id: 'num-40', name: '#40', category: 'Number', diameterIn: 0.0980, diameterMm: 2.4892 },
  { id: 'num-39', name: '#39', category: 'Number', diameterIn: 0.0995, diameterMm: 2.5273 },
  { id: 'num-38', name: '#38', category: 'Number', diameterIn: 0.1015, diameterMm: 2.5781 },
  { id: 'num-37', name: '#37', category: 'Number', diameterIn: 0.1040, diameterMm: 2.6416 },
  { id: 'num-36', name: '#36', category: 'Number', diameterIn: 0.1065, diameterMm: 2.7051 },
  { id: 'num-35', name: '#35', category: 'Number', diameterIn: 0.1100, diameterMm: 2.7940 },
  { id: 'num-34', name: '#34', category: 'Number', diameterIn: 0.1110, diameterMm: 2.8194 },
  { id: 'num-33', name: '#33', category: 'Number', diameterIn: 0.1130, diameterMm: 2.8702 },
  { id: 'num-32', name: '#32', category: 'Number', diameterIn: 0.1160, diameterMm: 2.9464 },
  { id: 'num-31', name: '#31', category: 'Number', diameterIn: 0.1200, diameterMm: 3.0480 },
  { id: 'num-30', name: '#30', category: 'Number', diameterIn: 0.1285, diameterMm: 3.2639 },
  { id: 'num-29', name: '#29', category: 'Number', diameterIn: 0.1360, diameterMm: 3.4544 },
  { id: 'num-28', name: '#28', category: 'Number', diameterIn: 0.1405, diameterMm: 3.5687 },
  { id: 'num-27', name: '#27', category: 'Number', diameterIn: 0.1440, diameterMm: 3.6576 },
  { id: 'num-26', name: '#26', category: 'Number', diameterIn: 0.1470, diameterMm: 3.7338 },
  { id: 'num-25', name: '#25', category: 'Number', diameterIn: 0.1495, diameterMm: 3.7973 },
  { id: 'num-24', name: '#24', category: 'Number', diameterIn: 0.1520, diameterMm: 3.8608 },
  { id: 'num-23', name: '#23', category: 'Number', diameterIn: 0.1540, diameterMm: 3.9116 },
  { id: 'num-22', name: '#22', category: 'Number', diameterIn: 0.1570, diameterMm: 3.9878 },
  { id: 'num-21', name: '#21', category: 'Number', diameterIn: 0.1590, diameterMm: 4.0386 },
  { id: 'num-20', name: '#20', category: 'Number', diameterIn: 0.1610, diameterMm: 4.0894 },
  { id: 'num-19', name: '#19', category: 'Number', diameterIn: 0.1660, diameterMm: 4.2164 },
  { id: 'num-18', name: '#18', category: 'Number', diameterIn: 0.1695, diameterMm: 4.3053 },
  { id: 'num-17', name: '#17', category: 'Number', diameterIn: 0.1730, diameterMm: 4.3942 },
  { id: 'num-16', name: '#16', category: 'Number', diameterIn: 0.1770, diameterMm: 4.4958 },
  { id: 'num-15', name: '#15', category: 'Number', diameterIn: 0.1800, diameterMm: 4.5720 },
  { id: 'num-14', name: '#14', category: 'Number', diameterIn: 0.1820, diameterMm: 4.6228 },
  { id: 'num-13', name: '#13', category: 'Number', diameterIn: 0.1850, diameterMm: 4.6990 },
  { id: 'num-12', name: '#12', category: 'Number', diameterIn: 0.1890, diameterMm: 4.8006 },
  { id: 'num-11', name: '#11', category: 'Number', diameterIn: 0.1910, diameterMm: 4.8514 },
  { id: 'num-10', name: '#10', category: 'Number', diameterIn: 0.1935, diameterMm: 4.9149 },
  { id: 'num-9', name: '#9', category: 'Number', diameterIn: 0.1960, diameterMm: 4.9784 },
  { id: 'num-8', name: '#8', category: 'Number', diameterIn: 0.1990, diameterMm: 5.0546 },
  { id: 'num-7', name: '#7', category: 'Number', diameterIn: 0.2010, diameterMm: 5.1054 },
  { id: 'num-6', name: '#6', category: 'Number', diameterIn: 0.2040, diameterMm: 5.1816 },
  { id: 'num-5', name: '#5', category: 'Number', diameterIn: 0.2055, diameterMm: 5.2197 },
  { id: 'num-4', name: '#4', category: 'Number', diameterIn: 0.2090, diameterMm: 5.3086 },
  { id: 'num-3', name: '#3', category: 'Number', diameterIn: 0.2130, diameterMm: 5.4102 },
  { id: 'num-2', name: '#2', category: 'Number', diameterIn: 0.2210, diameterMm: 5.6134 },
  { id: 'num-1', name: '#1', category: 'Number', diameterIn: 0.2280, diameterMm: 5.7912 },

  // Letter Drills A-Z
  { id: 'let-a', name: 'A', category: 'Letter', diameterIn: 0.2340, diameterMm: 5.9436 },
  { id: 'let-b', name: 'B', category: 'Letter', diameterIn: 0.2380, diameterMm: 6.0452 },
  { id: 'let-c', name: 'C', category: 'Letter', diameterIn: 0.2420, diameterMm: 6.1468 },
  { id: 'let-d', name: 'D', category: 'Letter', diameterIn: 0.2460, diameterMm: 6.2484 },
  { id: 'let-e', name: 'E', category: 'Letter', diameterIn: 0.2500, diameterMm: 6.3500 },
  { id: 'let-f', name: 'F', category: 'Letter', diameterIn: 0.2570, diameterMm: 6.5278 },
  { id: 'let-g', name: 'G', category: 'Letter', diameterIn: 0.2610, diameterMm: 6.6294 },
  { id: 'let-h', name: 'H', category: 'Letter', diameterIn: 0.2660, diameterMm: 6.7564 },
  { id: 'let-i', name: 'I', category: 'Letter', diameterIn: 0.2720, diameterMm: 6.9088 },
  { id: 'let-j', name: 'J', category: 'Letter', diameterIn: 0.2770, diameterMm: 7.0358 },
  { id: 'let-k', name: 'K', category: 'Letter', diameterIn: 0.2810, diameterMm: 7.1374 },
  { id: 'let-l', name: 'L', category: 'Letter', diameterIn: 0.2900, diameterMm: 7.3660 },
  { id: 'let-m', name: 'M', category: 'Letter', diameterIn: 0.2950, diameterMm: 7.4930 },
  { id: 'let-n', name: 'N', category: 'Letter', diameterIn: 0.3020, diameterMm: 7.6708 },
  { id: 'let-o', name: 'O', category: 'Letter', diameterIn: 0.3160, diameterMm: 8.0264 },
  { id: 'let-p', name: 'P', category: 'Letter', diameterIn: 0.3230, diameterMm: 8.2042 },
  { id: 'let-q', name: 'Q', category: 'Letter', diameterIn: 0.3320, diameterMm: 8.4328 },
  { id: 'let-r', name: 'R', category: 'Letter', diameterIn: 0.3390, diameterMm: 8.6106 },
  { id: 'let-s', name: 'S', category: 'Letter', diameterIn: 0.3480, diameterMm: 8.8392 },
  { id: 'let-t', name: 'T', category: 'Letter', diameterIn: 0.3580, diameterMm: 9.0932 },
  { id: 'let-u', name: 'U', category: 'Letter', diameterIn: 0.3680, diameterMm: 9.3472 },
  { id: 'let-v', name: 'V', category: 'Letter', diameterIn: 0.3770, diameterMm: 9.5758 },
  { id: 'let-w', name: 'W', category: 'Letter', diameterIn: 0.3860, diameterMm: 9.8044 },
  { id: 'let-x', name: 'X', category: 'Letter', diameterIn: 0.3970, diameterMm: 10.0838 },
  { id: 'let-y', name: 'Y', category: 'Letter', diameterIn: 0.4040, diameterMm: 10.2616 },
  { id: 'let-z', name: 'Z', category: 'Letter', diameterIn: 0.4130, diameterMm: 10.4902 },

  // Fractional Drills (1/64 to 1-1/2")
  { id: 'frac-1-64', name: '1/64 in', category: 'Fractional', diameterIn: 0.0156, diameterMm: 0.3969 },
  { id: 'frac-1-32', name: '1/32 in', category: 'Fractional', diameterIn: 0.0313, diameterMm: 0.7938 },
  { id: 'frac-3-64', name: '3/64 in', category: 'Fractional', diameterIn: 0.0469, diameterMm: 1.1906 },
  { id: 'frac-1-16', name: '1/16 in', category: 'Fractional', diameterIn: 0.0625, diameterMm: 1.5875 },
  { id: 'frac-5-64', name: '5/64 in', category: 'Fractional', diameterIn: 0.0781, diameterMm: 1.9844 },
  { id: 'frac-3-32', name: '3/32 in', category: 'Fractional', diameterIn: 0.0938, diameterMm: 2.3813 },
  { id: 'frac-7-64', name: '7/64 in', category: 'Fractional', diameterIn: 0.1094, diameterMm: 2.7781 },
  { id: 'frac-1-8', name: '1/8 in', category: 'Fractional', diameterIn: 0.1250, diameterMm: 3.1750 },
  { id: 'frac-9-64', name: '9/64 in', category: 'Fractional', diameterIn: 0.1406, diameterMm: 3.5719 },
  { id: 'frac-5-32', name: '5/32 in', category: 'Fractional', diameterIn: 0.1563, diameterMm: 3.9688 },
  { id: 'frac-11-64', name: '11/64 in', category: 'Fractional', diameterIn: 0.1719, diameterMm: 4.3656 },
  { id: 'frac-3-16', name: '3/16 in', category: 'Fractional', diameterIn: 0.1875, diameterMm: 4.7625 },
  { id: 'frac-13-64', name: '13/64 in', category: 'Fractional', diameterIn: 0.2031, diameterMm: 5.1594 },
  { id: 'frac-7-32', name: '7/32 in', category: 'Fractional', diameterIn: 0.2188, diameterMm: 5.5563 },
  { id: 'frac-15-64', name: '15/64 in', category: 'Fractional', diameterIn: 0.2344, diameterMm: 5.9531 },
  { id: 'frac-1-4', name: '1/4 in', category: 'Fractional', diameterIn: 0.2500, diameterMm: 6.3500 },
  { id: 'frac-17-64', name: '17/64 in', category: 'Fractional', diameterIn: 0.2656, diameterMm: 6.7469 },
  { id: 'frac-9-32', name: '9/32 in', category: 'Fractional', diameterIn: 0.2813, diameterMm: 7.1438 },
  { id: 'frac-19-64', name: '19/64 in', category: 'Fractional', diameterIn: 0.2969, diameterMm: 7.5406 },
  { id: 'frac-5-16', name: '5/16 in', category: 'Fractional', diameterIn: 0.3125, diameterMm: 7.9375 },
  { id: 'frac-21-64', name: '21/64 in', category: 'Fractional', diameterIn: 0.3281, diameterMm: 8.3344 },
  { id: 'frac-11-32', name: '11/32 in', category: 'Fractional', diameterIn: 0.3438, diameterMm: 8.7313 },
  { id: 'frac-23-64', name: '23/64 in', category: 'Fractional', diameterIn: 0.3594, diameterMm: 9.1281 },
  { id: 'frac-3-8', name: '3/8 in', category: 'Fractional', diameterIn: 0.3750, diameterMm: 9.5250 },
  { id: 'frac-25-64', name: '25/64 in', category: 'Fractional', diameterIn: 0.3906, diameterMm: 9.9219 },
  { id: 'frac-13-32', name: '13/32 in', category: 'Fractional', diameterIn: 0.4063, diameterMm: 10.3188 },
  { id: 'frac-27-64', name: '27/64 in', category: 'Fractional', diameterIn: 0.4219, diameterMm: 10.7156 },
  { id: 'frac-7-16', name: '7/16 in', category: 'Fractional', diameterIn: 0.4375, diameterMm: 11.1125 },
  { id: 'frac-29-64', name: '29/64 in', category: 'Fractional', diameterIn: 0.4531, diameterMm: 11.5094 },
  { id: 'frac-15-32', name: '15/32 in', category: 'Fractional', diameterIn: 0.4688, diameterMm: 11.9063 },
  { id: 'frac-31-64', name: '31/64 in', category: 'Fractional', diameterIn: 0.4844, diameterMm: 12.3031 },
  { id: 'frac-1-2', name: '1/2 in', category: 'Fractional', diameterIn: 0.5000, diameterMm: 12.7000 },
  { id: 'frac-33-64', name: '33/64 in', category: 'Fractional', diameterIn: 0.5156, diameterMm: 13.0969 },
  { id: 'frac-17-32', name: '17/32 in', category: 'Fractional', diameterIn: 0.5313, diameterMm: 13.4938 },
  { id: 'frac-35-64', name: '35/64 in', category: 'Fractional', diameterIn: 0.5469, diameterMm: 13.8906 },
  { id: 'frac-9-16', name: '9/16 in', category: 'Fractional', diameterIn: 0.5625, diameterMm: 14.2875 },
  { id: 'frac-37-64', name: '37/64 in', category: 'Fractional', diameterIn: 0.5781, diameterMm: 14.6844 },
  { id: 'frac-19-32', name: '19/32 in', category: 'Fractional', diameterIn: 0.5938, diameterMm: 15.0813 },
  { id: 'frac-39-64', name: '39/64 in', category: 'Fractional', diameterIn: 0.6094, diameterMm: 15.4781 },
  { id: 'frac-5-8', name: '5/8 in', category: 'Fractional', diameterIn: 0.6250, diameterMm: 15.8750 },
  { id: 'frac-41-64', name: '41/64 in', category: 'Fractional', diameterIn: 0.6406, diameterMm: 16.2719 },
  { id: 'frac-21-32', name: '21/32 in', category: 'Fractional', diameterIn: 0.6563, diameterMm: 16.6688 },
  { id: 'frac-43-64', name: '43/64 in', category: 'Fractional', diameterIn: 0.6719, diameterMm: 17.0656 },
  { id: 'frac-11-16', name: '11/16 in', category: 'Fractional', diameterIn: 0.6875, diameterMm: 17.4625 },
  { id: 'frac-45-64', name: '45/64 in', category: 'Fractional', diameterIn: 0.7031, diameterMm: 17.8594 },
  { id: 'frac-23-32', name: '23/32 in', category: 'Fractional', diameterIn: 0.7188, diameterMm: 18.2563 },
  { id: 'frac-47-64', name: '47/64 in', category: 'Fractional', diameterIn: 0.7344, diameterMm: 18.6531 },
  { id: 'frac-3-4', name: '3/4 in', category: 'Fractional', diameterIn: 0.7500, diameterMm: 19.0500 },
  { id: 'frac-49-64', name: '49/64 in', category: 'Fractional', diameterIn: 0.7656, diameterMm: 19.4469 },
  { id: 'frac-25-32', name: '25/32 in', category: 'Fractional', diameterIn: 0.7813, diameterMm: 19.8438 },
  { id: 'frac-51-64', name: '51/64 in', category: 'Fractional', diameterIn: 0.7969, diameterMm: 20.2406 },
  { id: 'frac-13-16', name: '13/16 in', category: 'Fractional', diameterIn: 0.8125, diameterMm: 20.6375 },
  { id: 'frac-53-64', name: '53/64 in', category: 'Fractional', diameterIn: 0.8281, diameterMm: 21.0344 },
  { id: 'frac-27-32', name: '27/32 in', category: 'Fractional', diameterIn: 0.8438, diameterMm: 21.4313 },
  { id: 'frac-55-64', name: '55/64 in', category: 'Fractional', diameterIn: 0.8594, diameterMm: 21.8281 },
  { id: 'frac-7-8', name: '7/8 in', category: 'Fractional', diameterIn: 0.8750, diameterMm: 22.2250 },
  { id: 'frac-57-64', name: '57/64 in', category: 'Fractional', diameterIn: 0.8906, diameterMm: 22.6219 },
  { id: 'frac-29-32', name: '29/32 in', category: 'Fractional', diameterIn: 0.9063, diameterMm: 23.0188 },
  { id: 'frac-59-64', name: '59/64 in', category: 'Fractional', diameterIn: 0.9219, diameterMm: 23.4156 },
  { id: 'frac-15-16', name: '15/16 in', category: 'Fractional', diameterIn: 0.9375, diameterMm: 23.8125 },
  { id: 'frac-61-64', name: '61/64 in', category: 'Fractional', diameterIn: 0.9531, diameterMm: 24.2094 },
  { id: 'frac-31-32', name: '31/32 in', category: 'Fractional', diameterIn: 0.9688, diameterMm: 24.6063 },
  { id: 'frac-63-64', name: '63/64 in', category: 'Fractional', diameterIn: 0.9844, diameterMm: 25.0031 },
  { id: 'frac-1-0', name: '1 in', category: 'Fractional', diameterIn: 1.0000, diameterMm: 25.4000 },
  { id: 'frac-1-1-64', name: '1 1/64 in', category: 'Fractional', diameterIn: 1.0156, diameterMm: 25.7969 },
  { id: 'frac-1-1-32', name: '1 1/32 in', category: 'Fractional', diameterIn: 1.0313, diameterMm: 26.1938 },
  { id: 'frac-1-3-64', name: '1 3/64 in', category: 'Fractional', diameterIn: 1.0469, diameterMm: 26.5906 },
  { id: 'frac-1-1-16', name: '1 1/16 in', category: 'Fractional', diameterIn: 1.0625, diameterMm: 26.9875 },
  { id: 'frac-1-5-64', name: '1 5/64 in', category: 'Fractional', diameterIn: 1.0781, diameterMm: 27.3844 },
  { id: 'frac-1-3-32', name: '1 3/32 in', category: 'Fractional', diameterIn: 1.0938, diameterMm: 27.7813 },
  { id: 'frac-1-7-64', name: '1 7/64 in', category: 'Fractional', diameterIn: 1.1094, diameterMm: 28.1781 },
  { id: 'frac-1-1-8', name: '1 1/8 in', category: 'Fractional', diameterIn: 1.1250, diameterMm: 28.5750 },
  { id: 'frac-1-9-64', name: '1 9/64 in', category: 'Fractional', diameterIn: 1.1406, diameterMm: 28.9719 },
  { id: 'frac-1-5-32', name: '1 5/32 in', category: 'Fractional', diameterIn: 1.1563, diameterMm: 29.3688 },
  { id: 'frac-1-11-64', name: '1 11/64 in', category: 'Fractional', diameterIn: 1.1719, diameterMm: 29.7656 },
  { id: 'frac-1-3-16', name: '1 3/16 in', category: 'Fractional', diameterIn: 1.1875, diameterMm: 30.1625 },
  { id: 'frac-1-13-64', name: '1 13/64 in', category: 'Fractional', diameterIn: 1.2031, diameterMm: 30.5594 },
  { id: 'frac-1-7-32', name: '1 7/32 in', category: 'Fractional', diameterIn: 1.2188, diameterMm: 30.9563 },
  { id: 'frac-1-15-64', name: '1 15/64 in', category: 'Fractional', diameterIn: 1.2344, diameterMm: 31.3531 },
  { id: 'frac-1-1-4', name: '1 1/4 in', category: 'Fractional', diameterIn: 1.2500, diameterMm: 31.7500 },
  { id: 'frac-1-17-64', name: '1 17/64 in', category: 'Fractional', diameterIn: 1.2656, diameterMm: 32.1469 },
  { id: 'frac-1-9-32', name: '1 9/32 in', category: 'Fractional', diameterIn: 1.2813, diameterMm: 32.5438 },
  { id: 'frac-1-19-64', name: '1 19/64 in', category: 'Fractional', diameterIn: 1.2969, diameterMm: 32.9406 },
  { id: 'frac-1-5-16', name: '1 5/16 in', category: 'Fractional', diameterIn: 1.3125, diameterMm: 33.3375 },
  { id: 'frac-1-21-64', name: '1 21/64 in', category: 'Fractional', diameterIn: 1.3281, diameterMm: 33.7344 },
  { id: 'frac-1-11-32', name: '1 11/32 in', category: 'Fractional', diameterIn: 1.3438, diameterMm: 34.1313 },
  { id: 'frac-1-23-64', name: '1 23/64 in', category: 'Fractional', diameterIn: 1.3594, diameterMm: 34.5281 },
  { id: 'frac-1-3-8', name: '1 3/8 in', category: 'Fractional', diameterIn: 1.3750, diameterMm: 34.9250 },
  { id: 'frac-1-25-64', name: '1 25/64 in', category: 'Fractional', diameterIn: 1.3906, diameterMm: 35.3219 },
  { id: 'frac-1-13-32', name: '1 13/32 in', category: 'Fractional', diameterIn: 1.4063, diameterMm: 35.7188 },
  { id: 'frac-1-27-64', name: '1 27/64 in', category: 'Fractional', diameterIn: 1.4219, diameterMm: 36.1156 },
  { id: 'frac-1-7-16', name: '1 7/16 in', category: 'Fractional', diameterIn: 1.4375, diameterMm: 36.5125 },
  { id: 'frac-1-29-64', name: '1 29/64 in', category: 'Fractional', diameterIn: 1.4531, diameterMm: 36.9094 },
  { id: 'frac-1-15-32', name: '1 15/32 in', category: 'Fractional', diameterIn: 1.4688, diameterMm: 37.3063 },
  { id: 'frac-1-31-64', name: '1 31/64 in', category: 'Fractional', diameterIn: 1.4844, diameterMm: 37.7031 },
  { id: 'frac-1-1-2', name: '1 1/2 in', category: 'Fractional', diameterIn: 1.5000, diameterMm: 38.1000 },

  // Metric Drills (0.05 mm to 38 mm)
  { id: 'met-0-05', name: '0.05 mm', category: 'Metric', diameterIn: 0.0020, diameterMm: 0.0500 },
  { id: 'met-0-10', name: '0.1 mm', category: 'Metric', diameterIn: 0.0039, diameterMm: 0.1000 },
  { id: 'met-0-20', name: '0.2 mm', category: 'Metric', diameterIn: 0.0079, diameterMm: 0.2000 },
  { id: 'met-0-30', name: '0.3 mm', category: 'Metric', diameterIn: 0.0118, diameterMm: 0.3000 },
  { id: 'met-0-40', name: '0.4 mm', category: 'Metric', diameterIn: 0.0157, diameterMm: 0.4000 },
  { id: 'met-0-50', name: '0.5 mm', category: 'Metric', diameterIn: 0.0197, diameterMm: 0.5000 },
  { id: 'met-0-60', name: '0.6 mm', category: 'Metric', diameterIn: 0.0236, diameterMm: 0.6000 },
  { id: 'met-0-70', name: '0.7 mm', category: 'Metric', diameterIn: 0.0276, diameterMm: 0.7000 },
  { id: 'met-0-80', name: '0.8 mm', category: 'Metric', diameterIn: 0.0315, diameterMm: 0.8000 },
  { id: 'met-0-90', name: '0.9 mm', category: 'Metric', diameterIn: 0.0354, diameterMm: 0.9000 },
  { id: 'met-1-00', name: '1 mm', category: 'Metric', diameterIn: 0.0394, diameterMm: 1.0000 },
  { id: 'met-1-10', name: '1.1 mm', category: 'Metric', diameterIn: 0.0433, diameterMm: 1.1000 },
  { id: 'met-1-20', name: '1.2 mm', category: 'Metric', diameterIn: 0.0472, diameterMm: 1.2000 },
  { id: 'met-1-30', name: '1.3 mm', category: 'Metric', diameterIn: 0.0512, diameterMm: 1.3000 },
  { id: 'met-1-40', name: '1.4 mm', category: 'Metric', diameterIn: 0.0551, diameterMm: 1.4000 },
  { id: 'met-1-50', name: '1.5 mm', category: 'Metric', diameterIn: 0.0591, diameterMm: 1.5000 },
  { id: 'met-1-60', name: '1.6 mm', category: 'Metric', diameterIn: 0.0630, diameterMm: 1.6000 },
  { id: 'met-1-70', name: '1.7 mm', category: 'Metric', diameterIn: 0.0669, diameterMm: 1.7000 },
  { id: 'met-1-80', name: '1.8 mm', category: 'Metric', diameterIn: 0.0709, diameterMm: 1.8000 },
  { id: 'met-1-90', name: '1.9 mm', category: 'Metric', diameterIn: 0.0748, diameterMm: 1.9000 },
  { id: 'met-2-00', name: '2 mm', category: 'Metric', diameterIn: 0.0787, diameterMm: 2.0000 },
  { id: 'met-2-10', name: '2.1 mm', category: 'Metric', diameterIn: 0.0827, diameterMm: 2.1000 },
  { id: 'met-2-20', name: '2.2 mm', category: 'Metric', diameterIn: 0.0866, diameterMm: 2.2000 },
  { id: 'met-2-30', name: '2.3 mm', category: 'Metric', diameterIn: 0.0906, diameterMm: 2.3000 },
  { id: 'met-2-40', name: '2.4 mm', category: 'Metric', diameterIn: 0.0945, diameterMm: 2.4000 },
  { id: 'met-2-50', name: '2.5 mm', category: 'Metric', diameterIn: 0.0984, diameterMm: 2.5000 },
  { id: 'met-2-60', name: '2.6 mm', category: 'Metric', diameterIn: 0.1024, diameterMm: 2.6000 },
  { id: 'met-2-70', name: '2.7 mm', category: 'Metric', diameterIn: 0.1063, diameterMm: 2.7000 },
  { id: 'met-2-80', name: '2.8 mm', category: 'Metric', diameterIn: 0.1102, diameterMm: 2.8000 },
  { id: 'met-2-90', name: '2.9 mm', category: 'Metric', diameterIn: 0.1142, diameterMm: 2.9000 },
  { id: 'met-3-00', name: '3 mm', category: 'Metric', diameterIn: 0.1181, diameterMm: 3.0000 },
  { id: 'met-3-10', name: '3.1 mm', category: 'Metric', diameterIn: 0.1220, diameterMm: 3.1000 },
  { id: 'met-3-20', name: '3.2 mm', category: 'Metric', diameterIn: 0.1260, diameterMm: 3.2000 },
  { id: 'met-3-30', name: '3.3 mm', category: 'Metric', diameterIn: 0.1299, diameterMm: 3.3000 },
  { id: 'met-3-40', name: '3.4 mm', category: 'Metric', diameterIn: 0.1339, diameterMm: 3.4000 },
  { id: 'met-3-50', name: '3.5 mm', category: 'Metric', diameterIn: 0.1378, diameterMm: 3.5000 },
  { id: 'met-3-60', name: '3.6 mm', category: 'Metric', diameterIn: 0.1417, diameterMm: 3.6000 },
  { id: 'met-3-70', name: '3.7 mm', category: 'Metric', diameterIn: 0.1457, diameterMm: 3.7000 },
  { id: 'met-3-80', name: '3.8 mm', category: 'Metric', diameterIn: 0.1496, diameterMm: 3.8000 },
  { id: 'met-3-90', name: '3.9 mm', category: 'Metric', diameterIn: 0.1535, diameterMm: 3.9000 },
  { id: 'met-4-00', name: '4 mm', category: 'Metric', diameterIn: 0.1575, diameterMm: 4.0000 },
  { id: 'met-4-10', name: '4.1 mm', category: 'Metric', diameterIn: 0.1614, diameterMm: 4.1000 },
  { id: 'met-4-20', name: '4.2 mm', category: 'Metric', diameterIn: 0.1654, diameterMm: 4.2000 },
  { id: 'met-4-30', name: '4.3 mm', category: 'Metric', diameterIn: 0.1693, diameterMm: 4.3000 },
  { id: 'met-4-40', name: '4.4 mm', category: 'Metric', diameterIn: 0.1732, diameterMm: 4.4000 },
  { id: 'met-4-50', name: '4.5 mm', category: 'Metric', diameterIn: 0.1772, diameterMm: 4.5000 },
  { id: 'met-4-60', name: '4.6 mm', category: 'Metric', diameterIn: 0.1811, diameterMm: 4.6000 },
  { id: 'met-4-70', name: '4.7 mm', category: 'Metric', diameterIn: 0.1850, diameterMm: 4.7000 },
  { id: 'met-4-80', name: '4.8 mm', category: 'Metric', diameterIn: 0.1890, diameterMm: 4.8000 },
  { id: 'met-4-90', name: '4.9 mm', category: 'Metric', diameterIn: 0.1929, diameterMm: 4.9000 },
  { id: 'met-5-00', name: '5 mm', category: 'Metric', diameterIn: 0.1969, diameterMm: 5.0000 },
  { id: 'met-5-10', name: '5.1 mm', category: 'Metric', diameterIn: 0.2008, diameterMm: 5.1000 },
  { id: 'met-5-20', name: '5.2 mm', category: 'Metric', diameterIn: 0.2047, diameterMm: 5.2000 },
  { id: 'met-5-30', name: '5.3 mm', category: 'Metric', diameterIn: 0.2087, diameterMm: 5.3000 },
  { id: 'met-5-40', name: '5.4 mm', category: 'Metric', diameterIn: 0.2126, diameterMm: 5.4000 },
  { id: 'met-5-50', name: '5.5 mm', category: 'Metric', diameterIn: 0.2165, diameterMm: 5.5000 },
  { id: 'met-5-60', name: '5.6 mm', category: 'Metric', diameterIn: 0.2205, diameterMm: 5.6000 },
  { id: 'met-5-70', name: '5.7 mm', category: 'Metric', diameterIn: 0.2244, diameterMm: 5.7000 },
  { id: 'met-5-80', name: '5.8 mm', category: 'Metric', diameterIn: 0.2283, diameterMm: 5.8000 },
  { id: 'met-5-90', name: '5.9 mm', category: 'Metric', diameterIn: 0.2323, diameterMm: 5.9000 },
  { id: 'met-6-00', name: '6 mm', category: 'Metric', diameterIn: 0.2362, diameterMm: 6.0000 },
  { id: 'met-6-10', name: '6.1 mm', category: 'Metric', diameterIn: 0.2402, diameterMm: 6.1000 },
  { id: 'met-6-20', name: '6.2 mm', category: 'Metric', diameterIn: 0.2441, diameterMm: 6.2000 },
  { id: 'met-6-30', name: '6.3 mm', category: 'Metric', diameterIn: 0.2480, diameterMm: 6.3000 },
  { id: 'met-6-40', name: '6.4 mm', category: 'Metric', diameterIn: 0.2520, diameterMm: 6.4000 },
  { id: 'met-6-50', name: '6.5 mm', category: 'Metric', diameterIn: 0.2559, diameterMm: 6.5000 },
  { id: 'met-6-60', name: '6.6 mm', category: 'Metric', diameterIn: 0.2598, diameterMm: 6.6000 },
  { id: 'met-6-70', name: '6.7 mm', category: 'Metric', diameterIn: 0.2638, diameterMm: 6.7000 },
  { id: 'met-6-80', name: '6.8 mm', category: 'Metric', diameterIn: 0.2677, diameterMm: 6.8000 },
  { id: 'met-6-90', name: '6.9 mm', category: 'Metric', diameterIn: 0.2717, diameterMm: 6.9000 },
  { id: 'met-7-00', name: '7 mm', category: 'Metric', diameterIn: 0.2756, diameterMm: 7.0000 },
  { id: 'met-7-10', name: '7.1 mm', category: 'Metric', diameterIn: 0.2795, diameterMm: 7.1000 },
  { id: 'met-7-20', name: '7.2 mm', category: 'Metric', diameterIn: 0.2835, diameterMm: 7.2000 },
  { id: 'met-7-30', name: '7.3 mm', category: 'Metric', diameterIn: 0.2874, diameterMm: 7.3000 },
  { id: 'met-7-40', name: '7.4 mm', category: 'Metric', diameterIn: 0.2913, diameterMm: 7.4000 },
  { id: 'met-7-50', name: '7.5 mm', category: 'Metric', diameterIn: 0.2953, diameterMm: 7.5000 },
  { id: 'met-7-60', name: '7.6 mm', category: 'Metric', diameterIn: 0.2992, diameterMm: 7.6000 },
  { id: 'met-7-70', name: '7.7 mm', category: 'Metric', diameterIn: 0.3031, diameterMm: 7.7000 },
  { id: 'met-7-80', name: '7.8 mm', category: 'Metric', diameterIn: 0.3071, diameterMm: 7.8000 },
  { id: 'met-7-90', name: '7.9 mm', category: 'Metric', diameterIn: 0.3110, diameterMm: 7.9000 },
  { id: 'met-8-00', name: '8 mm', category: 'Metric', diameterIn: 0.3150, diameterMm: 8.0000 },
  { id: 'met-8-10', name: '8.1 mm', category: 'Metric', diameterIn: 0.3189, diameterMm: 8.1000 },
  { id: 'met-8-20', name: '8.2 mm', category: 'Metric', diameterIn: 0.3228, diameterMm: 8.2000 },
  { id: 'met-8-30', name: '8.3 mm', category: 'Metric', diameterIn: 0.3268, diameterMm: 8.3000 },
  { id: 'met-8-40', name: '8.4 mm', category: 'Metric', diameterIn: 0.3307, diameterMm: 8.4000 },
  { id: 'met-8-50', name: '8.5 mm', category: 'Metric', diameterIn: 0.3346, diameterMm: 8.5000 },
  { id: 'met-8-60', name: '8.6 mm', category: 'Metric', diameterIn: 0.3386, diameterMm: 8.6000 },
  { id: 'met-8-70', name: '8.7 mm', category: 'Metric', diameterIn: 0.3425, diameterMm: 8.7000 },
  { id: 'met-8-80', name: '8.8 mm', category: 'Metric', diameterIn: 0.3465, diameterMm: 8.8000 },
  { id: 'met-8-90', name: '8.9 mm', category: 'Metric', diameterIn: 0.3504, diameterMm: 8.9000 },
  { id: 'met-9-00', name: '9 mm', category: 'Metric', diameterIn: 0.3543, diameterMm: 9.0000 },
  { id: 'met-9-10', name: '9.1 mm', category: 'Metric', diameterIn: 0.3583, diameterMm: 9.1000 },
  { id: 'met-9-20', name: '9.2 mm', category: 'Metric', diameterIn: 0.3622, diameterMm: 9.2000 },
  { id: 'met-9-30', name: '9.3 mm', category: 'Metric', diameterIn: 0.3661, diameterMm: 9.3000 },
  { id: 'met-9-40', name: '9.4 mm', category: 'Metric', diameterIn: 0.3701, diameterMm: 9.4000 },
  { id: 'met-9-50', name: '9.5 mm', category: 'Metric', diameterIn: 0.3740, diameterMm: 9.5000 },
  { id: 'met-9-60', name: '9.6 mm', category: 'Metric', diameterIn: 0.3780, diameterMm: 9.6000 },
  { id: 'met-9-70', name: '9.7 mm', category: 'Metric', diameterIn: 0.3819, diameterMm: 9.7000 },
  { id: 'met-9-80', name: '9.8 mm', category: 'Metric', diameterIn: 0.3858, diameterMm: 9.8000 },
  { id: 'met-9-90', name: '9.9 mm', category: 'Metric', diameterIn: 0.3898, diameterMm: 9.9000 },
  { id: 'met-10-00', name: '10 mm', category: 'Metric', diameterIn: 0.3937, diameterMm: 10.0000 },
  { id: 'met-10-50', name: '10.5 mm', category: 'Metric', diameterIn: 0.4134, diameterMm: 10.5000 },
  { id: 'met-11-00', name: '11 mm', category: 'Metric', diameterIn: 0.4331, diameterMm: 11.0000 },
  { id: 'met-11-50', name: '11.5 mm', category: 'Metric', diameterIn: 0.4528, diameterMm: 11.5000 },
  { id: 'met-12-00', name: '12 mm', category: 'Metric', diameterIn: 0.4724, diameterMm: 12.0000 },
  { id: 'met-12-50', name: '12.5 mm', category: 'Metric', diameterIn: 0.4921, diameterMm: 12.5000 },
  { id: 'met-13-00', name: '13 mm', category: 'Metric', diameterIn: 0.5118, diameterMm: 13.0000 },
  { id: 'met-13-50', name: '13.5 mm', category: 'Metric', diameterIn: 0.5315, diameterMm: 13.5000 },
  { id: 'met-14-00', name: '14 mm', category: 'Metric', diameterIn: 0.5512, diameterMm: 14.0000 },
  { id: 'met-14-50', name: '14.5 mm', category: 'Metric', diameterIn: 0.5709, diameterMm: 14.5000 },
  { id: 'met-15-00', name: '15 mm', category: 'Metric', diameterIn: 0.5906, diameterMm: 15.0000 },
  { id: 'met-15-50', name: '15.5 mm', category: 'Metric', diameterIn: 0.6102, diameterMm: 15.5000 },
  { id: 'met-16-00', name: '16 mm', category: 'Metric', diameterIn: 0.6299, diameterMm: 16.0000 },
  { id: 'met-16-50', name: '16.5 mm', category: 'Metric', diameterIn: 0.6496, diameterMm: 16.5000 },
  { id: 'met-17-00', name: '17 mm', category: 'Metric', diameterIn: 0.6693, diameterMm: 17.0000 },
  { id: 'met-17-50', name: '17.5 mm', category: 'Metric', diameterIn: 0.6890, diameterMm: 17.5000 },
  { id: 'met-18-00', name: '18 mm', category: 'Metric', diameterIn: 0.7087, diameterMm: 18.0000 },
  { id: 'met-18-50', name: '18.5 mm', category: 'Metric', diameterIn: 0.7283, diameterMm: 18.5000 },
  { id: 'met-19-00', name: '19 mm', category: 'Metric', diameterIn: 0.7480, diameterMm: 19.0000 },
  { id: 'met-19-50', name: '19.5 mm', category: 'Metric', diameterIn: 0.7677, diameterMm: 19.5000 },
  { id: 'met-20-00', name: '20 mm', category: 'Metric', diameterIn: 0.7874, diameterMm: 20.0000 },
  { id: 'met-20-50', name: '20.5 mm', category: 'Metric', diameterIn: 0.8071, diameterMm: 20.5000 },
  { id: 'met-21-00', name: '21 mm', category: 'Metric', diameterIn: 0.8268, diameterMm: 21.0000 },
  { id: 'met-21-50', name: '21.5 mm', category: 'Metric', diameterIn: 0.8465, diameterMm: 21.5000 },
  { id: 'met-22-00', name: '22 mm', category: 'Metric', diameterIn: 0.8661, diameterMm: 22.0000 },
  { id: 'met-22-50', name: '22.5 mm', category: 'Metric', diameterIn: 0.8858, diameterMm: 22.5000 },
  { id: 'met-23-00', name: '23 mm', category: 'Metric', diameterIn: 0.9055, diameterMm: 23.0000 },
  { id: 'met-23-50', name: '23.5 mm', category: 'Metric', diameterIn: 0.9252, diameterMm: 23.5000 },
  { id: 'met-24-00', name: '24 mm', category: 'Metric', diameterIn: 0.9449, diameterMm: 24.0000 },
  { id: 'met-24-50', name: '24.5 mm', category: 'Metric', diameterIn: 0.9646, diameterMm: 24.5000 },
  { id: 'met-25-00', name: '25 mm', category: 'Metric', diameterIn: 0.9843, diameterMm: 25.0000 },
  { id: 'met-25-50', name: '25.5 mm', category: 'Metric', diameterIn: 1.0039, diameterMm: 25.5000 },
  { id: 'met-26-00', name: '26 mm', category: 'Metric', diameterIn: 1.0236, diameterMm: 26.0000 },
  { id: 'met-26-50', name: '26.5 mm', category: 'Metric', diameterIn: 1.0433, diameterMm: 26.5000 },
  { id: 'met-27-00', name: '27 mm', category: 'Metric', diameterIn: 1.0630, diameterMm: 27.0000 },
  { id: 'met-27-50', name: '27.5 mm', category: 'Metric', diameterIn: 1.0827, diameterMm: 27.5000 },
  { id: 'met-28-00', name: '28 mm', category: 'Metric', diameterIn: 1.1024, diameterMm: 28.0000 },
  { id: 'met-28-50', name: '28.5 mm', category: 'Metric', diameterIn: 1.1220, diameterMm: 28.5000 },
  { id: 'met-29-00', name: '29 mm', category: 'Metric', diameterIn: 1.1417, diameterMm: 29.0000 },
  { id: 'met-29-50', name: '29.5 mm', category: 'Metric', diameterIn: 1.1614, diameterMm: 29.5000 },
  { id: 'met-30-00', name: '30 mm', category: 'Metric', diameterIn: 1.1811, diameterMm: 30.0000 },
  { id: 'met-30-50', name: '30.5 mm', category: 'Metric', diameterIn: 1.2008, diameterMm: 30.5000 },
  { id: 'met-31-00', name: '31 mm', category: 'Metric', diameterIn: 1.2205, diameterMm: 31.0000 },
  { id: 'met-31-50', name: '31.5 mm', category: 'Metric', diameterIn: 1.2402, diameterMm: 31.5000 },
  { id: 'met-32-00', name: '32 mm', category: 'Metric', diameterIn: 1.2598, diameterMm: 32.0000 },
  { id: 'met-32-50', name: '32.5 mm', category: 'Metric', diameterIn: 1.2795, diameterMm: 32.5000 },
  { id: 'met-33-00', name: '33 mm', category: 'Metric', diameterIn: 1.2992, diameterMm: 33.0000 },
  { id: 'met-33-50', name: '33.5 mm', category: 'Metric', diameterIn: 1.3189, diameterMm: 33.5000 },
  { id: 'met-34-00', name: '34 mm', category: 'Metric', diameterIn: 1.3386, diameterMm: 34.0000 },
  { id: 'met-34-50', name: '34.5 mm', category: 'Metric', diameterIn: 1.3583, diameterMm: 34.5000 },
  { id: 'met-35-00', name: '35 mm', category: 'Metric', diameterIn: 1.3780, diameterMm: 35.0000 },
  { id: 'met-35-50', name: '35.5 mm', category: 'Metric', diameterIn: 1.3976, diameterMm: 35.5000 },
  { id: 'met-36-00', name: '36 mm', category: 'Metric', diameterIn: 1.4173, diameterMm: 36.0000 },
  { id: 'met-36-50', name: '36.5 mm', category: 'Metric', diameterIn: 1.4370, diameterMm: 36.5000 },
  { id: 'met-37-00', name: '37 mm', category: 'Metric', diameterIn: 1.4567, diameterMm: 37.0000 },
  { id: 'met-37-50', name: '37.5 mm', category: 'Metric', diameterIn: 1.4764, diameterMm: 37.5000 },
  { id: 'met-38-00', name: '38 mm', category: 'Metric', diameterIn: 1.4961, diameterMm: 38.0000 },
];

export const DrillSizeIndex: React.FC = () => {
  const { unit } = useUnit();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'All' | 'Number' | 'Letter' | 'Fractional' | 'Metric'>('All');
  const [sortField, setSortField] = useState<'diameter' | 'name'>('diameter');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedDrillId, setSelectedDrillId] = useState<string>('frac-1-4'); // default 1/4"
  const [hoveredDrillId, setHoveredDrillId] = useState<string | null>(null);

  // Filter and Sort Drills
  const filteredDrills = useMemo(() => {
    return DRILL_DATABASE.filter((d) => {
      const matchesCat = selectedCategory === 'All' || d.category === selectedCategory;
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch = !q || 
        d.name.toLowerCase().includes(q) || 
        d.diameterIn.toString().includes(q) || 
        d.diameterMm.toString().includes(q) ||
        d.category.toLowerCase().includes(q);
      return matchesCat && matchesSearch;
    }).sort((a, b) => {
      if (sortField === 'diameter') {
        return sortOrder === 'asc' ? a.diameterIn - b.diameterIn : b.diameterIn - a.diameterIn;
      } else {
        return sortOrder === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
      }
    });
  }, [searchQuery, selectedCategory, sortField, sortOrder]);

  const selectedDrill = useMemo(() => {
    return DRILL_DATABASE.find(d => d.id === selectedDrillId) || DRILL_DATABASE[0];
  }, [selectedDrillId]);

  // Scaled visualization properties (Max diameter in our table is 1.5 in / 38 mm)
  // Map drill diameter to an SVG bit width between 4px and 120px
  const maxDiameterIn = 1.5;
  const bitVisualHeightPx = Math.max(6, (selectedDrill.diameterIn / maxDiameterIn) * 110);
  const bitLengthPx = Math.min(260, Math.max(120, 100 + (selectedDrill.diameterIn * 80)));

  // Lineup ("school picture") — filtered drills, always smallest → biggest, wrapping rows
  const lineupDrills = useMemo(
    () => [...filteredDrills].sort((a, b) => a.diameterIn - b.diameterIn),
    [filteredDrills]
  );
  const lineupMaxIn = lineupDrills.length ? lineupDrills[lineupDrills.length - 1].diameterIn : maxDiameterIn;
  const CAT_COLORS: Record<DrillItem['category'], string> = {
    Number: '#38bdf8',
    Letter: '#c084fc',
    Fractional: '#fbbf24',
    Metric: '#00ff80',
  };
  const infoDrill = useMemo(
    () => (hoveredDrillId ? DRILL_DATABASE.find(d => d.id === hoveredDrillId) : undefined) || selectedDrill,
    [hoveredDrillId, selectedDrill]
  );

  return (
    <div style={{ maxWidth: '1250px', margin: '0 auto', padding: '10px 0' }}>
      {/* Compact Title Bar */}
      <div style={{ marginBottom: '18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#fff', margin: 0 }}>
          🗂️ Drill Size Index <span style={{ color: 'var(--accent-cyan)', fontWeight: 400 }}>// Scale Chart</span>
        </h2>
        <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', background: 'var(--bg-secondary)', padding: '6px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
          <strong style={{ color: '#fff' }}>{DRILL_DATABASE.length}</strong> Standard Drills
        </div>
      </div>

      {/* Visual Drill Index Lineup — grows/shrinks with the active filter */}
      <div className="glass-panel" style={{ padding: '18px 22px', marginBottom: '25px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '12px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700 }}>
            DRILL INDEX LINEUP — {lineupDrills.length} BITS (SMALLEST → BIGGEST)
          </div>
          {/* Live details for hovered / selected bit */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', background: 'var(--bg-primary)', border: `1px solid ${CAT_COLORS[infoDrill.category]}`, borderRadius: '8px', padding: '6px 14px' }}>
            <strong style={{ color: CAT_COLORS[infoDrill.category], fontSize: '1rem' }}>{infoDrill.name}</strong>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem', textTransform: 'uppercase' }}>{infoDrill.category}</span>
            <span style={{ color: '#fff' }}>{infoDrill.diameterIn.toFixed(4)}"</span>
            <span style={{ color: 'var(--text-secondary)' }}>{infoDrill.diameterMm.toFixed(3)} mm</span>
          </div>
        </div>

        <div
          onMouseLeave={() => setHoveredDrillId(null)}
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'flex-end',
            gap: '3px',
            rowGap: '14px',
            background: 'var(--bg-primary)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            padding: '14px 12px',
            maxHeight: '340px',
            overflowY: 'auto',
            transition: 'all 0.25s ease'
          }}
        >
          {lineupDrills.map((d) => {
            const frac = Math.sqrt(d.diameterIn / lineupMaxIn); // sqrt keeps tiny bits visible
            const w = Math.max(3, Math.round(3 + frac * 15));
            const h = Math.max(16, Math.round(14 + frac * 78));
            const color = CAT_COLORS[d.category];
            const isSel = d.id === selectedDrillId;
            const isHov = d.id === hoveredDrillId;
            return (
              <div
                key={d.id}
                onClick={() => setSelectedDrillId(d.id)}
                onMouseEnter={() => setHoveredDrillId(d.id)}
                title={`${d.name} — ${d.diameterIn.toFixed(4)}" / ${d.diameterMm.toFixed(3)} mm (${d.category})`}
                style={{
                  width: `${w}px`,
                  height: `${h}px`,
                  cursor: 'pointer',
                  background: `linear-gradient(90deg, ${color} 0%, #e2e8f0 45%, ${color} 100%)`,
                  clipPath: 'polygon(0 0, 100% 0, 100% 82%, 50% 100%, 0 82%)',
                  opacity: isSel || isHov ? 1 : 0.72,
                  outline: isSel ? '2px solid #fff' : isHov ? `2px solid ${color}` : 'none',
                  outlineOffset: '1px',
                  transform: isSel || isHov ? 'scaleY(1.08)' : 'none',
                  transformOrigin: 'bottom',
                  transition: 'opacity 0.12s ease, transform 0.12s ease',
                  flexShrink: 0
                }}
              />
            );
          })}
          {lineupDrills.length === 0 && (
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', padding: '10px' }}>No drills match the current filter.</span>
          )}
        </div>

        {/* Category color legend */}
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginTop: '10px' }}>
          {(Object.keys(CAT_COLORS) as DrillItem['category'][]).map(cat => (
            <span key={cat} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: CAT_COLORS[cat], display: 'inline-block' }} />
              {cat} ({DRILL_DATABASE.filter(d => d.category === cat).length})
            </span>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '25px' }}>
        
        {/* Left Card: Interactive Controls & Search Table */}
        <div className="glass-panel" style={{ padding: '25px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Search and Category Filters */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="Search drill size (e.g., #7, 1/4, 0.201, 6mm)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-precision"
                style={{ width: '100%', paddingLeft: '38px' }}
              />
              <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: '1.1rem', color: 'var(--text-muted)' }}>
                🔍
              </span>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1rem' }}
                >
                  ✕
                </button>
              )}
            </div>

            {/* Category Pills */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {(['All', 'Number', 'Letter', 'Fractional', 'Metric'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '20px',
                    border: '1px solid',
                    borderColor: selectedCategory === cat ? 'var(--accent-cyan)' : 'var(--border-color)',
                    background: selectedCategory === cat ? 'rgba(244, 144, 44, 0.15)' : 'var(--bg-primary)',
                    color: selectedCategory === cat ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                    fontWeight: 600,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {cat === 'All' ? '🌐 All Drills' : cat === 'Number' ? '# Number (#1-#107)' : cat === 'Letter' ? '🔤 Letter (A-Z)' : cat === 'Fractional' ? '📐 Fractional' : '📏 Metric'}
                </button>
              ))}
            </div>
          </div>

          {/* Table Header / Sorting */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, padding: '0 10px' }}>
            <span>Drill Size ({filteredDrills.length} results)</span>
            <div style={{ display: 'flex', gap: '15px' }}>
              <span 
                onClick={() => { setSortField('name'); setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc'); }}
                style={{ cursor: 'pointer', color: sortField === 'name' ? 'var(--accent-cyan)' : 'inherit' }}
              >
                Name {sortField === 'name' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
              </span>
              <span 
                onClick={() => { setSortField('diameter'); setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc'); }}
                style={{ cursor: 'pointer', color: sortField === 'diameter' ? 'var(--accent-cyan)' : 'inherit' }}
              >
                Diameter {sortField === 'diameter' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
              </span>
            </div>
          </div>

          {/* Virtualized / Scrollable Drill List */}
          <div style={{ 
            maxHeight: '480px', 
            overflowY: 'auto', 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '6px', 
            paddingRight: '6px',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--bg-primary)',
            padding: '8px'
          }}>
            {filteredDrills.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                No drill sizes matching "{searchQuery}" in category "{selectedCategory}".
              </div>
            ) : (
              filteredDrills.map((drill) => {
                const isSelected = drill.id === selectedDrillId;
                return (
                  <div
                    key={drill.id}
                    onClick={() => setSelectedDrillId(drill.id)}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '10px 14px',
                      borderRadius: '6px',
                      background: isSelected ? 'linear-gradient(90deg, rgba(244, 144, 44, 0.2), rgba(0, 128, 255, 0.1))' : 'transparent',
                      border: '1px solid',
                      borderColor: isSelected ? 'var(--accent-cyan)' : 'transparent',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      color: isSelected ? '#fff' : 'var(--text-primary)'
                    }}
                    onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
                    onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ 
                        display: 'inline-block', 
                        width: '75px', 
                        fontWeight: 700, 
                        fontSize: '0.95rem', 
                        color: isSelected ? 'var(--accent-cyan)' : '#fff' 
                      }}>
                        {drill.name}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: '4px', textTransform: 'uppercase' }}>
                        {drill.category}
                      </span>
                    </div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', display: 'flex', gap: '15px', fontWeight: 600 }}>
                      <span style={{ color: unit === 'imperial' ? 'var(--accent-cyan)' : 'var(--text-secondary)' }}>
                        {drill.diameterIn.toFixed(4)}"
                      </span>
                      <span style={{ color: unit === 'metric' ? 'var(--accent-cyan)' : 'var(--text-muted)', minWidth: '65px', textAlign: 'right' }}>
                        {drill.diameterMm.toFixed(3)} mm
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Card (Ordered Left: order: -1): Interactive Scaled Drill Bit Visualizer */}
        <div className="glass-panel" style={{ padding: '25px', display: 'flex', flexDirection: 'column', gap: '20px', background: 'linear-gradient(145deg, rgba(15, 23, 42, 0.95) 0%, rgba(20, 30, 48, 0.8) 100%)', order: -1 }}>
          
          <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                SCALED VISUAL INSPECTION
              </span>
              <h3 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff', margin: 0 }}>
                {selectedDrill.name} <span style={{ fontSize: '1rem', color: 'var(--accent-cyan)', fontWeight: 400 }}>({selectedDrill.category} Drill)</span>
              </h3>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '1.4rem', fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--accent-cyan)' }}>
                {unit === 'imperial' ? `${selectedDrill.diameterIn.toFixed(4)} in` : `${selectedDrill.diameterMm.toFixed(3)} mm`}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                {unit === 'imperial' ? `${selectedDrill.diameterMm.toFixed(3)} mm eq.` : `${selectedDrill.diameterIn.toFixed(4)} in eq.`}
              </div>
            </div>
          </div>

          {/* SVG Twist Drill Bit Simulation to Scale */}
          <div style={{
            background: 'var(--bg-primary)',
            borderRadius: 'var(--radius-md)',
            border: '2px solid var(--accent-cyan)',
            padding: '30px 20px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            minHeight: '260px',
            boxShadow: '0 10px 30px rgba(244, 144, 44, 0.15)'
          }}>
            <div style={{ position: 'absolute', top: '10px', left: '15px', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
              118° STANDARD POINT TWIST DRILL PREVIEW
            </div>

            {/* Scaled SVG Bit */}
            <svg viewBox="0 0 320 140" style={{ width: '100%', maxWidth: '300px', height: '140px', overflow: 'visible' }}>
              <defs>
                <linearGradient id="drillShankGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#94a3b8" />
                  <stop offset="30%" stopColor="#f8fafc" />
                  <stop offset="70%" stopColor="#64748b" />
                  <stop offset="100%" stopColor="#334155" />
                </linearGradient>
                <linearGradient id="drillFluteGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#475569" />
                  <stop offset="50%" stopColor="#cbd5e1" />
                  <stop offset="100%" stopColor="#1e293b" />
                </linearGradient>
                <pattern id="flutePattern" width="20" height="20" patternUnits="userSpaceOnUse" patternTransform="rotate(25)">
                  <rect x="0" y="0" width="10" height="20" fill="#334155" />
                  <rect x="10" y="0" width="10" height="20" fill="#64748b" />
                </pattern>
              </defs>

              {/* Center line */}
              <line x1="10" y1="70" x2="310" y2="70" stroke="rgba(255,255,255,0.15)" strokeDasharray="4 4" />

              {/* Drill Shank (Left portion) */}
              <rect
                x={150 - bitLengthPx / 2}
                y={70 - bitVisualHeightPx / 2}
                width={bitLengthPx * 0.4}
                height={bitVisualHeightPx}
                fill="url(#drillShankGrad)"
                rx="1"
              />

              {/* Drill Flute Body (Right portion) */}
              <rect
                x={150 - bitLengthPx / 2 + bitLengthPx * 0.4}
                y={70 - bitVisualHeightPx / 2}
                width={bitLengthPx * 0.55}
                height={bitVisualHeightPx}
                fill="url(#drillFluteGrad)"
              />
              <rect
                x={150 - bitLengthPx / 2 + bitLengthPx * 0.4}
                y={70 - bitVisualHeightPx / 2}
                width={bitLengthPx * 0.55}
                height={bitVisualHeightPx}
                fill="url(#flutePattern)"
                opacity="0.35"
              />

              {/* Drill Point Tip (118 degree angle triangle on right end) */}
              <polygon
                points={`
                  ${150 - bitLengthPx / 2 + bitLengthPx * 0.95},${70 - bitVisualHeightPx / 2}
                  ${150 - bitLengthPx / 2 + bitLengthPx + Math.min(15, bitVisualHeightPx * 0.3)},70
                  ${150 - bitLengthPx / 2 + bitLengthPx * 0.95},${70 + bitVisualHeightPx / 2}
                `}
                fill="url(#drillShankGrad)"
              />

              {/* Dimension Callout Lines */}
              <line 
                x1={150 - bitLengthPx / 2 + bitLengthPx * 0.4} 
                y1={70 - bitVisualHeightPx / 2 - 12} 
                x2={150 - bitLengthPx / 2 + bitLengthPx * 0.4} 
                y2={70 + bitVisualHeightPx / 2 + 12} 
                stroke="var(--accent-cyan)" 
                strokeWidth="1" 
                strokeDasharray="2 2"
              />
              <text x={150} y={135} fill="var(--accent-cyan)" fontSize="11" fontWeight="700" textAnchor="middle" fontFamily="var(--font-mono)">
                DIA: {unit === 'imperial' ? `${selectedDrill.diameterIn.toFixed(4)}"` : `${selectedDrill.diameterMm.toFixed(3)} mm`}
              </text>
            </svg>

            {/* Scale Gauge Indicator */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginTop: '10px', width: '100%', justifyContent: 'space-around', background: 'rgba(0,0,0,0.3)', padding: '10px', borderRadius: '6px' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>DECIMAL EQUIVALENT</span>
                <strong style={{ fontFamily: 'var(--font-mono)', color: '#fff', fontSize: '1rem' }}>{selectedDrill.diameterIn.toFixed(4)}"</strong>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>METRIC EQUIVALENT</span>
                <strong style={{ fontFamily: 'var(--font-mono)', color: '#fff', fontSize: '1rem' }}>{selectedDrill.diameterMm.toFixed(3)} mm</strong>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>FRACTIONAL APPROX</span>
                <strong style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-gold)', fontSize: '1rem' }}>
                  {Math.round(selectedDrill.diameterIn * 64)}/64"
                </strong>
              </div>
            </div>
          </div>

          {/* Quick Machinist Tips Box */}
          <div style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: 'var(--radius-sm)', borderLeft: '4px solid var(--accent-gold)' }}>
            <h4 style={{ color: 'var(--accent-gold)', fontSize: '0.9rem', marginBottom: '6px' }}>💡 Machinist Application Guide</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
              Standard twist drills feature a <strong>118° point angle</strong> suitable for general purpose steel, cast iron, and aluminum. For stainless steel or hard alloys, consider a <strong>135° split point</strong> to prevent drill walking and reduce thrust requirements.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
};

export default DrillSizeIndex;
