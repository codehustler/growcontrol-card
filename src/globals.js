// Expose React/ReactDOM as globals BEFORE any vendor .jsx runs, so the
// prototype's `const {useState} = React` and window.* registration work
// unchanged. This module must be imported first in index.jsx.
import React from 'react';
import { createRoot } from 'react-dom/client';

window.React = React;
window.ReactDOM = { createRoot };
