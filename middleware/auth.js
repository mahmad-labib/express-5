global.app.use(function (req, res, next) {
    if (req.header('jwt_token')) {
        var token = req.header('jwt_token')
        try {
            var bearer = global.jwt.verify(token, global.jwt_secret);
            req.user = bearer;
            next();
        } catch (error) {
            next()
        }
    } else {
        next();
    }
});


loginRequired = function loginRequired(req, res, next) {
    if (req.user) {
        return next()
    } else {
        const error = new Error('Something went wrong!');
        error.status = 404;
        next(error);
        // res.json({
        //     msg: 'you need to sign in',
        //     code: '401'
        // })
        // return 
    }
}

alreadylogin = function alreadylogin(req, res, next) {
    if (req.user) {
        res.json({
            msg: 'you are already logged in',
            code: '406'
        })
    } else {
        return next();
    }
}


// roleGate = async function roleGate(req, res, next, gateRole) {
//     var userRoles = req.user.roles;
//     if (roles) {
//         var roleState = await checkRole(userRoles, gateRole);
//         if (roleState) {
//             next()
//         } else {
//             res.json(new global.Forbidden())
//         }
//     }
//     res.json(new global.Forbidden())
// }

function checkRole(userRoles, gateRole) {
    var valid = userRoles.find(o => o.name === gateRole);
    return valid;
}

global.grantAccess = function grantAccess(gateRole) {
    return async (req, res, next) => {
        if (!req.user) {
            res.json(new global.Forbidden())
        }
        var userRoles = req.user.roles
        const permission = await checkRole(userRoles, gateRole);
        if (permission) {
            next();
        } else {
            res.json(new global.Forbidden())
        }
    }
}