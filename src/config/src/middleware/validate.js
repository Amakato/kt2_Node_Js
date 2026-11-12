module.exports = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(
      { ...req.body, ...req.query, ...req.params },
      { abortEarly: false, allowUnknown: true }
    );

    if (error) {
      const details = error.details.map((err) => ({
        message: err.message,
        path: err.path
      }));
      return res.status(400).json({ details });
    }

    next();
  };
};