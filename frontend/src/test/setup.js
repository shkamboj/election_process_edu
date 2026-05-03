import '@testing-library/jest-dom';

// Mock scrollIntoView for jsdom (not implemented)
Element.prototype.scrollIntoView = () => {};
