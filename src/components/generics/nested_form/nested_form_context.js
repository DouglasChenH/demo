import React from 'react';
import Immutable from "immutable";
// Make sure the shape of the default value passed to
// createContext matches the shape that the consumers expect!
export const NestedFromContext = React.createContext({
  nestedValues: Immutable.Map(),
  updateNestedValues: () => {},
});