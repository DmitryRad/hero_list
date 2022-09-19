import { useHttp } from '../../hooks/http.hook';
import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { CSSTransition, TransitionGroup } from 'react-transition-group';

import { heroesFetching, heroesFetched, heroesFetchingError, heroDeleted } from '../../actions';
import HeroesListItem from "../heroesListItem/HeroesListItem";
import Spinner from '../spinner/Spinner';

import './heroesList.scss';

// Задача для этого компонента:
// При клике на "крестик" идет удаление персонажа из общего состояния
// Усложненная задача:
// Удаление идет и с json файла при помощи метода DELETE

const HeroesList = (props) => {

    const filteredHeroes = useSelector(state => {
         if (state.filters.activeFilter === 'all') {
             console.log('render');
             return state.heroes.heroes;
         } else {
             return state.heroes.heroes.filter(item => item.element === state.filters.activeFilter)
         }
    })

    const heroesLoadingStatus = useSelector(state => state.heroesLoadingStatus);
    const dispatch = useDispatch();
    const { request } = useHttp();

    useEffect(() => {
        dispatch(heroesFetching());
        request("http://localhost:3001/heroes")
            .then(data => dispatch(heroesFetched(data)))
            .catch(() => dispatch(heroesFetchingError()))

        // eslint-disable-next-line
    }, []);


    // Функция удаления персонажа из store по его id
    // оборачиваем в useCallback, т.к. эта функция передается вниз по иерархии как проперти дочернего компонента
    // чтобы каждый раз не вызывать перереднеринг дочерних компонентов
    const onDelete = useCallback((id) => {
        // по запросу берем id героя, который приходит в функцию в качестве аргумента
        // метод DELETE - чтобы удалить персонажа
        request('http://localhost:3001/heroes/${id}', "DELETE")
            // выводим в консоль данные того персонажа, который был удален
            // убеждаюсь, что запрос прошел успешно
            .then(data => console.log(data, 'Deleted'))
            // только когда запрос прошел успешно - диспетчим новое действие
            // а именно удаление персонажа
            .then(dispatch(heroDeleted(id)))
            .catch(err => console.log(err));
        // eslint-disable-next-line
    }, [request]);

    if (heroesLoadingStatus === "loading") {
        return <Spinner/>;
    } else if (heroesLoadingStatus === "error") {
        return <h5 className="text-center mt-5">Ошибка загрузки</h5>
    }

    const renderHeroesList = (arr) => {
        if (arr.length === 0) {
            return (
                <CSSTransition
                    timeout={0}
                    classNames="hero">
                    <h5 className="text-center mt-5">Героев пока нет</h5>
                </CSSTransition>
            )
        }

        return arr.map(({id, ...props}) => {
            return (
                <CSSTransition
                    key={id}
                    timeout={500}
                    classNames="hero">
                    <HeroesListItem {...props} onDelete={() => onDelete(id)}/>
                </CSSTransition>
            )
        })
    }

    const elements = renderHeroesList(filteredHeroes);
    return (
        <TransitionGroup component="ul">
            {elements}
        </TransitionGroup>
    )
}

export default HeroesList;