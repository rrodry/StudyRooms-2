const { Question, Category, User, Answer, Review, Votesxquestion, Ratingxquestion, Comment} = require('../db.js');
const { Op, Sequelize } = require('sequelize');

const getRatingSumQuestions = (questionId) => Ratingxquestion.findOne({
    where: {
        questionId
    },
    attributes: [
        'questionId',
        [Sequelize.fn('sum', Sequelize.col('rating')), 'sum'],
    ],
    group: ['questionId']
});

const createQuestion = async (req, res, next) => {
    try {
        const {
            userId,
            title,
            description,
            categories
        } = req.body;

        if (!userId || !title || !description || !categories) {
            return res.status(401).json({ error: "faltan datos", data: null })
        }

        let newQuestion = await Question.create({
            userId, title, description, ratingAverage: 0, ratingCount: 0, voteCount: 0, isFeatured: false, isDeleted: false
        })

        categories.forEach(async (c) => {
            const category = await Category.findOne({ where: { category: c } }); // 
            if (category) { await newQuestion.addCategory(category) };           // 
        });

        return res.status(201).json({ error: null, data: newQuestion })

    } catch (error) {
        return res.status(500).json({ error: `Error en el controlador de create question ${error}`, data: null })
    }
}

const getQuestion = async (req, res) => {
    try {
        const { questionId } = req.params;
        if (questionId) {
            let result = await Question.findAll(
                {
                    where: {
                        id: questionId,
                        isDeleted: false
                    },
                    include: [
                        {
                            model: Votesxquestion
                        },
                        {
                            model: Answer,
                            include:[{
                                model: User,
                                attributes: { exclude: ['hashedPassword'] }
                            }]
                        },
                        {
                            model: Comment,
                            include:[{
                                model: User,
                                attributes: { exclude: ['hashedPassword'] }
                            }]
                        },
                        {
                            model: Category
                        },
                        {
                            model: User,
                            attributes: ['id', 'avatar', 'userName', 'email']
                        }
                    ]
                }
            );
            if (!result[0]) {
                return res.status(500).send({ error: "No se encuentran preguntas para estos datos", data: null })
            }
            return res.status(200).json({ error: null, data: result })
        }

    } catch (error) {
        return res.status(500).json({ error: 'Error en el controlador de questions al obtener las preguntas', data: null })
    }
}

const getAllQuestions = async (req, res) => {
    try {
        let result = await Question.findAll({
            include: [
                { model: Answer},
                { model: Category },
                { model: Votesxquestion },
                {
                    model: User,
                    attributes: ['id', 'avatar', 'userName', 'email']
                }]
        });
        return res.status(200).json({ error: null, data: result })
    } catch (error) {
        return res.status(500).json({ error: 'Error en el controlador de questions al obtener las preguntas', data: null })
    }
}

const getQuestions = async (req, res) => {
    try {
        let result = await Question.findAll({
            where: {
                isDeleted: false
            },
            include: [
                { model: Answer},
                { model: Category },
                { model: Votesxquestion },
                {
                    model: User,
                    attributes: ['id', 'avatar', 'userName', 'email']
                }]
        });
        return res.status(200).json({ error: null, data: result })
    } catch (error) {
        return res.status(500).json({ error: 'Error en el controlador de questions al obtener las preguntas', data: null })
    }
}

const getDeletedQuestions = async (req, res) => {
    try {
        let result = await Question.findAll({
            where: {
                isDeleted: true
            },
            include: [
                { model: Answer },
                { model: Category },
                { model: Votesxquestion },
                {
                    model: User,
                    attributes: ['id', 'avatar', 'userName', 'email']
                }]
        });
        return res.status(200).json({ error: null, data: result })
    } catch (error) {
        return res.status(500).json({ error: 'Error en el controlador de questions al obtener las preguntas eliminadas', data: null })
    }
}

const updateQuestion = async (req, res) => {
    try {
        const questionId = req.params.questionId;
        const { userId,
            title,
            description,
            categories
        } = req.body;

        if (!title || !questionId || !userId || !description || !categories) {
            return res.status(401).json({
                error: "Falta algun dato",
                data: null
            })
        }
        const updateQuestion = await Question.update({ title, description }, {
            where: {
                id: questionId
            }
        });

        // categories.forEach(async (c) => {
        //     const category = await Category.findOne({ where: { category: c } }); // 
        //     if (category) { await updateQuestion.addCategory(category) };           // 
        // });

        if (updateQuestion[0] !== 0) {
            const response = await Question.findByPk(questionId, {
                include: [
                    { model: Category },
                    {
                        model: User,
                        attributes: ['id', 'avatar', 'userName', 'email']
                    }
                ]
            });

            return res.status(200).json({ error: null, data: response })
        }
        else {
            res.status(500).json({ error: 'No se puedo editar la pregunta', data: null })
        }
    } catch (error) {

        return res.status(501).json({ error: `Error en el controlador de quetion al actualizar la pregunta ${error}`, data: null })
    }
}

const deleteQuestion = async (req, res) => {
    try {
        const questionId = req.params.questionId;
        const questionToCheck = await Question.findByPk(questionId, {
            include: [
                {
                    model: User,
                    attributes: ['id']
                }]
            });
        if(req.user.isAdmin !== true && req.user.id !== questionToCheck.user.id) return res.status(401).send("Unauthorized")

        if (questionId) {
            // let result = await Question.destroy({ where: { id: questionId } });
            const result = await Question.update({ isDeleted: true }, { where: { id: questionId } });
            console.log('result: ', result)
            if (result[0] !== 0) {
                const response = await Question.findByPk(questionId, {
                    include: [
                        { model: Category },
                        {
                            model: User,
                            attributes: ['id', 'avatar', 'userName', 'email']
                        }]
                });
                return res.status(200).json({ error: null, data: 'Se borro la pregunta id: ' + questionId })
            }
            return res.status(200).json({ error: 'No se puedo borrar la pregunta', data: null })
        }
    } catch (error) {
        return res.status(500).json({ error: `Error al eliminar la pregunta en el controlador de question: ${error}`, data: null })
    }
}

const viewQuestion = async (req, res) => {
    const { userId, questionId } = req.body;
    try {

        const view = { userId, questionId, rating: true }
        const newView = await Review.create(view)

        return res.status(200).json({ msg: 'visto exitosamente', error: null, newView })
    }

    catch (error) {
        return res.status(500).json({ error: `Error en  reviewQuestion: ${error}`, data: null })
    }
}

const likeQuestion = async (req, res) => {
    const { userId, questionId } = req.body;
    try {

        if (!userId || !questionId) {
            return res.status(401).json({
                error: "The required fields userId and questionId are not present in the request, please add them. ",
                data: null
            })
        }

        const like = { userId, questionId }
        const newVote = await Votesxquestion.create(like)
        const voteCountUpdated = await Votesxquestion.count({
            where: {
                questionId
            }
        })
        const questionItem = await Question.findByPk(questionId);
        questionItem.voteCount = voteCountUpdated;
        await questionItem.save();

        return res.status(200).json({ msg: 'voto creado exitosamente', error: null, newVote })
    }

    catch (error) {
        return res.status(500).json({ error: `Error en el controlador de question al hacer like: ${error}`, data: null })

    }
}

const unlikeQuestion = async (req, res) => {
    try {
        const questionId = parseInt(req.params.questionId)    //req.params.questionId;
        const { userId } = req.query;

        const vote = await Votesxquestion.findOne({ where: { questionId: questionId, userId: userId } })
        if(vote){
            await vote.destroy();
            return res.status(200).json({ error: null, data: 'Se borro el voto id: ' })
        }
        else{
            return res.status(404).json({ error: 'no se encontó el voto', data: null })
        }

    } catch (error) {

        return res.status(500).json({ error: `Error en el controlador de question al eliminar el voto: ${error}`, data: null })
    }
}

const getQuestionsByUser = async (req, res) => {
    try {

        const { userId } = req.params
        const questionList = await Question.findAll({ where: { userId } })

        if (!questionList.length) return res.status(404).json({ data: [], error: "no se encontraron preguntas para ese userId" })

        // el ratingCount viene en tipo string (!!! si no anda checkear esto)
        const sortedList = questionList.sort((a, b) => parseFloat(b.ratingAverage) - parseFloat(a.ratingAverage))

        return res.status(200).json({ data: sortedList, error: null })

    } catch (error) {
        return res.status(500).json({ data: null, errror: "error en el questionsController" })
    }
}

const logDelete = async (req, res) => {
    try {
        const questionId = req.params.questionId;
        const isDeleted = req.body.active;

        const updateQuestion = await Question.update({ isDeleted }, {
            where: {
                id: questionId
            }

        });
        console.log(isDeleted)
        if (updateQuestion[0] !== 0) {
            const response = await Question.findByPk(questionId, {
                include: [
                    { model: Category },
                    {
                        model: User,
                        attributes: ['id', 'avatar', 'userName', 'email']
                    }
                ]
            });
            return res.status(200).json({ error: null, data: response })

        }
        else {
            res.status(500).json({ error: 'No se puedo editar la pregunta', data: null })
        }
    } catch (error) {
        return res.status(501).json({ error: `Error en el controlador de question al actualizar la pregunta ${error}`, data: null })
    }
}

const rateQuestion = async (req, res) => {
    const { userId, questionId, rating } = req.body;
    try {

        if (!userId || !questionId || !rating) {
            return res.status(401).json({
                error: "The required fields userId, questionId, and rating are not present in the request, please add them. ",
                data: null
            })
        }

        let rateItem = await Ratingxquestion.findOne({
            where: {
                userId, questionId
            }
        });

        if (!rateItem) {
            const rateNew = { userId, questionId, rating }
            await Ratingxquestion.create(rateNew)
        }
        else {
            rateItem.rating = rating;
            rateItem.save();
        }

        const rateCountUpdated = await Ratingxquestion.count({
            where: {
                questionId
            }
        });

        const rateSumUpdated = await getRatingSumQuestions(questionId);
        const questionItem = await Question.findByPk(questionId);

        questionItem.ratingCount = rateCountUpdated;
        questionItem.ratingAverage = rateSumUpdated.getDataValue('sum') / rateCountUpdated;
        await questionItem.save();

        let ratingList = await queryRatingList(userId)

        return res.status(200).json({
            questionItem: {
                userId,
                ratingCount: questionItem.ratingCount,
                ratingAverage: questionItem.ratingAverage
            },
            ratingList
        });
    }

    catch (error) {
        return res.status(500).json({ error: `Error en el controlador de answer al hacer votos: ${error}`, data: null })

    }
}

const getRatingListQ = async (req, res) => {
    const { userId } = req.params;
    try {

        if (!userId) {
            return res.status(401).json({
                error: "The required fields userId and questionId are not present in the request, please add them.",
                data: null
            })
        }

        let ratingList = await queryRatingList(userId)
        return res.status(200).json(ratingList);
    }

    catch (error) {
        return res.status(500).json({ error: `API answerController error: ${error}`, data: null })

    }
}

function queryRatingList(userId) {
    return Question.findAll(
        {

            include: [
                {
                    model: Ratingxquestion,
                    where: {
                        userId
                    }
                },
            ]
        }
    );
}


module.exports = { createQuestion, updateQuestion, getQuestions, getQuestion, deleteQuestion, viewQuestion, likeQuestion, unlikeQuestion, logDelete, rateQuestion, getQuestionsByUser, getAllQuestions, viewQuestion, getDeletedQuestions, getRatingListQ }







