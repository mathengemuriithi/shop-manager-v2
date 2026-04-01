// middleware/auth.js
// Protects admin routes — checks if the user session is authenticated.
// To add this protection, simply call `isAuthenticated` as route middleware.

function isAuthenticated(req, res, next) {
  if (req.session && req.session.isAdmin === true) {
    return next();
  }
  req.flash('error', 'Please log in to access the admin panel.');
  res.redirect('/login');
}

module.exports = { isAuthenticated };
