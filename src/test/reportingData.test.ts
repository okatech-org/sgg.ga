/**
 * SGG Digital — Tests des donnees de reporting
 * Verifie l'integrite et la coherence des donnees mock
 */

import { describe, it, expect } from 'vitest';
import { PILIERS, PROGRAMMES } from '@/data/reportingData';

describe('PILIERS (8 piliers presidentiels)', () => {
  it('should contain exactly 8 piliers', () => {
    expect(PILIERS).toHaveLength(8);
  });

  it('should have unique IDs', () => {
    const ids = PILIERS.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('should have unique codes', () => {
    const codes = PILIERS.map((p) => p.code);
    expect(new Set(codes).size).toBe(codes.length);
  });

  it('should have a color for each pilier', () => {
    PILIERS.forEach((p) => {
      expect(p.couleur).toMatch(/^#[0-9A-Fa-f]{6}$/);
    });
  });

  it('should have a name for each pilier', () => {
    PILIERS.forEach((p) => {
      expect(p.nom.length).toBeGreaterThan(3);
    });
  });

  it('should have an icon for each pilier', () => {
    PILIERS.forEach((p) => {
      expect(p.icone).toBeTruthy();
    });
  });
});

describe('PROGRAMMES (10 programmes PAG)', () => {
  it('should contain exactly 10 programmes', () => {
    expect(PROGRAMMES).toHaveLength(10);
  });

  it('should have unique IDs', () => {
    const ids = PROGRAMMES.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('should have unique code programmes', () => {
    const codes = PROGRAMMES.map((p) => p.codeProgramme);
    expect(new Set(codes).size).toBe(codes.length);
  });

  it('should reference valid pilier IDs', () => {
    const validPilierIds = PILIERS.map((p) => p.id);
    PROGRAMMES.forEach((prog) => {
      expect(validPilierIds).toContain(prog.pilierId);
    });
  });

  it('should have a mesure presidentielle for each programme', () => {
    PROGRAMMES.forEach((prog) => {
      expect(prog.mesurePresidentielle.length).toBeGreaterThan(10);
    });
  });

  it('should have a libelle for each programme', () => {
    PROGRAMMES.forEach((prog) => {
      expect(prog.libelleProgramme.length).toBeGreaterThan(5);
    });
  });

  it('should have objectifs and resultats for each programme', () => {
    PROGRAMMES.forEach((prog) => {
      expect(prog.objectifStrategique.length).toBeGreaterThan(10);
      expect(prog.resultatsAttendus.length).toBeGreaterThan(10);
    });
  });
});
