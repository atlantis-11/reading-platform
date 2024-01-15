module.exports = (obj, keysToExclude) => {
    const filteredEntries = Object.entries(obj).filter(([key]) => !keysToExclude.includes(key));
    const filteredObject = Object.fromEntries(filteredEntries);
    return filteredObject;
};