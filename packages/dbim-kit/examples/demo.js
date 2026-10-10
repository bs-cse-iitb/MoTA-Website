// Gallery only: switch the DBIM colour group (html[data-dbim-group]).
(function () {
  var sel = document.getElementById('group-select');
  if (!sel) return;
  var q = new URLSearchParams(location.search).get('group');
  if (q) { sel.value = q; document.documentElement.setAttribute('data-dbim-group', q); }
  sel.addEventListener('change', function () {
    document.documentElement.setAttribute('data-dbim-group', sel.value);
    history.replaceState(null, '', '?group=' + sel.value);
  });
})();
