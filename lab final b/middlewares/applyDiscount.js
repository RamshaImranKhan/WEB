const applyDiscount = (req, res, next) => {
    const couponCode = req.query.coupon || req.body.coupon;
    let discountPercent = 0;
    let couponMessage = '';

    if (couponCode === 'SAVE10') {
        discountPercent = 0.10;
        couponMessage = 'Coupon SAVE10 applied!';
    } else if (couponCode) {
        couponMessage = 'Invalid coupon code.';
    }

    req.discount = {
        percent: discountPercent,
        code: couponCode,
        message: couponMessage
    };

    next();
};

module.exports = applyDiscount;
