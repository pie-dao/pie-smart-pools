module.exports = {
    mocha: {
      grep: "@skip-on-coverage", // Find everything with this tag
      invert: true               // Run the grep's inverse set.
    },
    providerOptions: {
        gasLimit: 1000000000,
        allowUnlimitedContractSize: true
    }
  }