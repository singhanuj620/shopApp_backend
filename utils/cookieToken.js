const cookieToken = (user, res) => {
    const token = user.getJwtToken();
    const option = {
        expires: new Date(Date.now() + process.env.COOKIE_EXPIRY * 24 * 60 * 60 * 1000),
        httpOnly: true
    }
    res.status(200).cookie('token', token, option).json({
        status: 'success',
        token,
        user
    })
}

module.exports = cookieToken