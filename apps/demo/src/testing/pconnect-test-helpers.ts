import { Provider } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { AngularPConnectService, Utils } from '@pega/angular-sdk-components';

/**
 * Test helpers for components that extend the SDK's FieldBase.
 *
 * FieldBase talks to Constellation through `pConn$` and AngularPConnectService.
 * In a unit test there is no Constellation engine, so these fakes return
 * the config you pass in and record what the component sends back.
 */

export interface FakeFieldConfig {
  label?: string;
  value?: unknown;
  required?: boolean;
  readOnly?: boolean;
  disabled?: boolean;
  visibility?: boolean;
  displayMode?: string;
  helperText?: string;
  placeholder?: string;
  testId?: string;
  [key: string]: unknown;
}

export interface FakePConnect {
  getConfigProps: () => FakeFieldConfig;
  resolveConfigProps: (props: FakeFieldConfig) => FakeFieldConfig;
  getStateProps: () => { value: string };
  getActionsApi: () => FakeActionsApi;
  clearErrorMessages: (args: { property: string }) => void;
  getContextName: () => string;
  getPageReference: () => string;
  getValue: (prop: string) => unknown;
  getComponentName: () => string;
  /** Lets a test change the config and re-render, like Constellation does after a state change. */
  setConfig: (next: FakeFieldConfig) => void;
  calls: { clearErrorMessages: string[] };
}

export interface FakeActionsApi {
  updateFieldValue: (prop: string, value: unknown) => void;
  triggerFieldChange: (prop: string, value: unknown) => void;
  calls: { updateFieldValue: [string, unknown][]; triggerFieldChange: [string, unknown][] };
}

export function createFakePConnect(config: FakeFieldConfig = {}, propName = '.TestProperty'): FakePConnect {
  let current: FakeFieldConfig = { label: 'Test field', value: '', visibility: true, ...config };
  const actions: FakeActionsApi = {
    calls: { updateFieldValue: [], triggerFieldChange: [] },
    updateFieldValue(prop, value) {
      actions.calls.updateFieldValue.push([prop, value]);
    },
    triggerFieldChange(prop, value) {
      actions.calls.triggerFieldChange.push([prop, value]);
    }
  };
  const fake: FakePConnect = {
    calls: { clearErrorMessages: [] },
    getConfigProps: () => current,
    resolveConfigProps: props => props,
    getStateProps: () => ({ value: propName }),
    getActionsApi: () => actions,
    clearErrorMessages: ({ property }) => fake.calls.clearErrorMessages.push(property),
    getContextName: () => 'app/primary_1',
    getPageReference: () => 'caseInfo.content',
    getValue: () => undefined,
    getComponentName: () => 'TestComponent',
    setConfig: next => {
      current = { ...current, ...next };
    }
  };
  return fake;
}

export interface FakeAngularPConnect {
  validateMessage?: string;
}

/**
 * Replaces AngularPConnectService so FieldBase can register without the engine.
 * Set `state.validateMessage` to simulate a server-side validation error.
 */
export function provideFakeAngularPConnect(state: FakeAngularPConnect = {}): Provider {
  return {
    provide: AngularPConnectService,
    useValue: {
      registerAndSubscribeComponent: () => ({ unsubscribeFn: () => undefined, validateMessage: state.validateMessage }),
      getComponentID: () => 'test-control',
      shouldComponentUpdate: () => true
    }
  };
}

/**
 * Replaces the SDK's Utils service, whose constructor needs the global PCore.
 * Add methods here as components start to need them.
 */
export function provideFakeUtils(): Provider {
  return {
    provide: Utils,
    useValue: {
      getBooleanValue: (value: unknown) => value === true || value === 'true'
    }
  };
}

/** Everything a FieldBase component needs from DI in a unit test. */
export function provideFieldTestProviders(state: FakeAngularPConnect = {}): Provider[] {
  return [provideFakeAngularPConnect(state), provideFakeUtils()];
}

/** Inputs every FieldBase component expects. Pass to fixture.componentRef.setInput. */
export function fieldInputs(pConn: FakePConnect, formGroup = new FormGroup({})) {
  return { pConn$: pConn, formGroup$: formGroup };
}
