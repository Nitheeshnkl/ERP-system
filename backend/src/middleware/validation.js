const Joi = require('joi');
const { error } = require('../utils/response');

const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    const { value, error: validationError } = schema.validate(req[source], {
      abortEarly: false,
      stripUnknown: true,
    });

    if (validationError) {
      return error(
        res,
        `Validation failed: ${validationError.details.map((d) => d.message).join(', ')}`,
        400
      );
    }

    req[source] = value;
    return next();
  };
};

const objectIdSchema = Joi.object({
  id: Joi.string().length(24).hex().required(),
});

module.exports = {
  validate,
  objectIdSchema,
};
