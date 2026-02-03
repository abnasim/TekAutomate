/* ===================== tm_devices Device Types and Drivers ===================== */

export const TM_DEVICE_TYPES = {
  SCOPE: {
    label: 'Oscilloscope',
    drivers: ['MSO2', 'MSO2A', 'MSO4', 'MSO4B', 'MSO5', 'MSO5B', 'MSO5LP', 'MSO6', 'MSO6B', 'MSO70KDX', 'MSO70KC', 'DPO5K', 'DPO7K', 'DPO70K', 'MDO3000', 'MDO4000', 'MDO4000B', 'MDO4000C']
  },
  AWG: {
    label: 'Arbitrary Waveform Generator',
    drivers: ['AWG5K', 'AWG5KC', 'AWG7K', 'AWG7KC', 'AWG70KA', 'AWG70KB']
  },
  AFG: {
    label: 'Arbitrary Function Generator',
    drivers: ['AFG3K', 'AFG3KB', 'AFG3KC', 'AFG31K']
  },
  PSU: {
    label: 'Power Supply',
    drivers: ['PSU2200', 'PSU2220', 'PSU2230', 'PSU2231', 'PSU2280', 'PSU2281']
  },
  SMU: {
    label: 'Source Measure Unit',
    drivers: ['SMU2400', 'SMU2450', 'SMU2460', 'SMU2461', 'SMU2470', 'SMU2601B', 'SMU2602B', 'SMU2604B', 'SMU2606B', 'SMU2611B', 'SMU2612B', 'SMU2614B', 'SMU2634B', 'SMU2635B', 'SMU2636B', 'SMU2651A', 'SMU2657A']
  },
  DMM: {
    label: 'Digital Multimeter',
    drivers: ['DMM6500', 'DMM7510', 'DMM7512']
  },
  DAQ: {
    label: 'Data Acquisition',
    drivers: ['DAQ6510']
  },
  MT: {
    label: 'Margin Tester',
    drivers: ['MT1000']
  },
  MF: {
    label: 'Mainframe',
    drivers: ['MF4000']
  },
  SS: {
    label: 'Switch System',
    drivers: ['SS3706A']
  }
} as const;

export type DeviceType = keyof typeof TM_DEVICE_TYPES;
