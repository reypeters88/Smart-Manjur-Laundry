try { eval(WScript.StdIn.ReadAll()); WScript.Echo('OK'); } catch (e) { WScript.Echo('Error: ' + e.message + ' at line ' + e.line); }
