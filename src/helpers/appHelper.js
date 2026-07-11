/**
 * 
 * @param {String} message The messaage to repond
 * @param {Object} data The data to send with the answer
 * 
 * @returns {Object}
 */
export const success = (message, data = null) => {
    return {
        "success": true,
        message,
        data
    }
}
/**
 * 
 * @param {String} message The messaage to repond
 * @param {Object} error The error to send with the answer
 * 
 * @returns {Object}
 */
export const fail = (message, errors = null) => {
    return {
        "success": false,
        message,
        errors
    }
}