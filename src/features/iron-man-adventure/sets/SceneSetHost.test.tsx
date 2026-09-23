import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import SceneSetHost, { SCENE_SETS_REGISTRY } from './SceneSetHost';
import { SCENE_ACTOR_GROUNDINGS } from './ironManSceneGrounding';

describe('SceneSetHost and 10 Spatial Scene Sets', () => {
  it('contains all 10 distinct scene sets in registry', () => {
    expect(SCENE_SETS_REGISTRY).toHaveLength(10);
    const sceneIds = SCENE_SETS_REGISTRY.map((s) => s.id);
    expect(sceneIds).toEqual([
      'signal-lab',
      'armor-platform',
      'launch-tunnel',
      'deep-space-flight',
      'black-cloud-storm',
      'glass-valley',
      'dark-valley-search',
      'star-shelter',
      'lighthouse-veins',
      'dawn-sky-peak',
    ]);
  });

  SCENE_SETS_REGISTRY.forEach((setMeta, index) => {
    it(`renders scene ${index + 1}: ${setMeta.title} (${setMeta.id}) with far/mid/near depth planes`, () => {
      const { container } = render(<SceneSetHost sceneIndex={index} showIronMan={false} />);

      const host = container.querySelector('[data-scene-set-host]');
      expect(host).toHaveAttribute('data-scene-set-host', setMeta.id);

      const sceneSet = container.querySelector(`[data-scene-set="${setMeta.id}"]`);
      expect(sceneSet).toBeInTheDocument();

      // Check spatial planes
      expect(container.querySelector('[data-plane="far"]')).toBeInTheDocument();
      expect(container.querySelector('[data-plane="middle"]')).toBeInTheDocument();
      expect(container.querySelector('[data-plane="near"]')).toBeInTheDocument();
    });

    it(`naturally grounds Iron Man actor in scene ${index + 1} with custom action pose`, () => {
      const { container } = render(<SceneSetHost sceneIndex={index} showIronMan={true} />);

      const actor = container.querySelector('[data-grounded-actor="iron-man"]');
      expect(actor).toBeInTheDocument();
      const expectedGrounding = SCENE_ACTOR_GROUNDINGS[index];
      expect(actor).toHaveAttribute('data-actor-action', expectedGrounding.action);
    });
  });

  it('supports camera shot modes: wide, medium, close, and auto', () => {
    const { container, rerender } = render(<SceneSetHost sceneIndex={0} cameraShot="wide" />);
    expect(container.querySelector('.iron-scene-set-host')).toHaveAttribute('data-camera-shot', 'wide');

    rerender(<SceneSetHost sceneIndex={0} cameraShot="close" />);
    expect(container.querySelector('.iron-scene-set-host')).toHaveAttribute('data-camera-shot', 'close');

    rerender(<SceneSetHost sceneIndex={0} cameraShot="auto" />);
    expect(container.querySelector('.iron-scene-set-host')).toHaveAttribute('data-camera-shot', 'auto');
  });
});
