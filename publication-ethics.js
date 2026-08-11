(() => {
  const policyDetails = [...document.querySelectorAll('.policy-details')];
  if (!policyDetails.length) return;

  const openPolicyTarget = (hash = window.location.hash) => {
    if (!hash || hash === '#') return;
    const target = document.getElementById(decodeURIComponent(hash.slice(1)));
    const details = target?.matches('[data-policy-document]')
      ? target.querySelector('.policy-details')
      : target?.closest('.policy-details');
    if (details) details.open = true;
  };

  document.querySelector('[data-expand-policies]')?.addEventListener('click', () => {
    policyDetails.forEach((details) => { details.open = true; });
  });

  document.querySelector('[data-collapse-policies]')?.addEventListener('click', () => {
    policyDetails.forEach((details) => { details.open = false; });
  });

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', () => openPolicyTarget(link.getAttribute('href')));
  });

  window.addEventListener('hashchange', () => openPolicyTarget());
  openPolicyTarget();

  let printState = [];
  window.addEventListener('beforeprint', () => {
    printState = policyDetails.map((details) => details.open);
    policyDetails.forEach((details) => { details.open = true; });
  });
  window.addEventListener('afterprint', () => {
    policyDetails.forEach((details, index) => { details.open = Boolean(printState[index]); });
  });
})();
