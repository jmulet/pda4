import { RestService } from '../../../services/rest.service';
import { AsyncSubject } from 'rxjs/AsyncSubject';

export const BADGES_TYPES = {
    FA: 400,
    RE: 401,
    ATTENDANCE: [400, 401],
    HOMEWORK: [200, 201, 300],
    CLASSWORK: [202, 203, 204],
    BEHAVIOUR: [303, 302, 301, 204, 205, 305]
};

// Class to handle badge logic and search
export class BadgesLogic {
    badges: any;
    ids: any;
    rest: RestService;

    constructor(badges, ids, rest) {
        //console.log('Rest service is injected??? ', rest);
        this.badges = badges;
        this.ids = ids;
        this.rest = rest;
    }


    filterNotType(type) {
        return this.badges.filter(function (e) {
            return e.type !== type;
        });
    }

    filterType(type) {
        return this.badges.filter(function (e) {
            let found;
            if (Array.isArray(type)) {
                found = (type.indexOf(e.type) >= 0);
            } else {
                found = (e.type === type);
            }
            return found;
        });
    }

    hasType(type) {
        const n = this.badges.length;
        for (let i = 0; i < n; i++) {
            if (this.badges[i].type === type) {
                return true;
            }
        }
        return false;
    }

    hasId(id) {
        const n = this.badges.length;
        for (let i = 0; i < n; i++) {
            if (this.badges[i].id === id) {
                return true;
            }
        }
        return false;
    }

    removeType(type) {
        let removed = 0;
        for (let i = 0; i < this.badges.length; i++) {
            if (this.badges[i].type === type) {
                this.badges.splice(i, 1);
                removed += 1;
            }
        }
        Object.keys(this.ids).forEach(
            (key) => {
                if (key === type) {
                    this.rest.removeBadge(this.ids[key]);
                    this.ids[key] = null;
                }
            }
        );
        return removed;
    }

    removeId(id) {
        const async = new AsyncSubject();
        this.rest.removeBadge(id).subscribe( (d) => {
            // Must return an observer to subscribe when all ready
            async.next(d);
            async.complete();
        });
        const n = this.badges.length;
        for (let i = 0; i < n; i++) {
            if (this.badges[i].id === id) {
                this.badges.splice(i, 1);
                break;
            }
        }
        if (this.ids) {
            Object.entries(this.ids).forEach(
                ([key, value]) => {
                    if (value === id) {
                        this.ids[key] = null;
                    }
                }
            );
        }
        return async;
    }

    addId(id, idUser, date, type, score, idGroup) {
        if (this.hasId(id)) {
            return;
        }
        this.badges.push({ id: id, idCreator: idUser, day: date, type: type, rscore: score, idGroup: idGroup });
        if (this.ids) {
            this.ids[type] = id;
        }
    }

    createBadge(idUser, day, type, rscore, idGroup) {
        const async = new AsyncSubject();
        this.rest.addBadge(idUser, day, type, rscore, idGroup).subscribe(
            (d: any) => {
                if (d.ok) {
                    this.addId(d.id, idUser, day, type, rscore, idGroup);
                }
                // Must return an observer to subscribe when all ready
                async.next(d);
                async.complete();
            }
        );
        return async;
    }

    addType(id, idUser, date, type, score, idGroup) {
        if (this.hasType(type)) {
            return;
        }
        this.badges.push({ id: id, idCreator: idUser, day: date, type: type, rscore: score, idGroup: idGroup });
        this.ids[type] = id;
    }

    /**
           * Test methods; check if it is possible to add things
           * Apply logic here
           * No badges allowed, except 401, if type 400 is in badges
           * If type 401 & !id, remove 400 if present
           * If type 400 & !id, remove 401 if present
           *
    */
    testAction(type, id): boolean {

        if (type !== 400 && type !== 401 && !id) {
            if (this.hasType(400)) {
                //console.log('Logic:: cannot add badges when FA is active');
                return false;
            }
        }

        if (type === 400 && !id) {
            const filtered = this.filterNotType(400);
            if (filtered.length) {
                //console.log('Logic:: FA is added, after ANY OTHER badges are removed including RE');
                // Must remove the badge
                filtered.forEach( (b) => this.removeId(b.id) );
            }
        }

        if (type === 401 && !id) {
            const filtered = this.filterType(400);
            if (filtered.length) {
                // //console.log('Logic:: Cannot add RE, manually remove FA');
                //console.log('Logic:: before adding RE, FA is removed');
                // Must remove these badges
                filtered.forEach( (b) => this.removeId(b.id) );
            }
        }

        if ((type === 200 || type === 201) && !id) {
            const filtered = this.filterType(300);
            if (filtered.length) {
                //console.log('Logic:: Homework ++ or + is added, after Homework - is removed');
                filtered.forEach( (b) => this.removeId(b.id) );
            }
        }


        if (type === 300 && !id) {
            const filtered = this.filterType([200, 201]);
            if (filtered.length) {
                //console.log('Logic:: Homework - is added, after Homework + or ++ is removed');
                filtered.forEach( (b) => this.removeId(b.id) );
            }
        }

        if ((type === 202 || type === 203) && !id) {
            const filtered = this.filterType(304);
            if (filtered.length) {
                //console.log('Logic:: Classwork ++ or + is added, after classwork - is removed');
                filtered.forEach( (b) => this.removeId(b.id) );
            }
        }

        if (type === 304 && !id) {
            const filtered = this.filterType([202, 203]);
            if (filtered.length) {
                //console.log('Logic:: Class work - is added, after Class work + or ++ is removed');
                filtered.forEach( (b) => this.removeId(b.id) );
            }
        }

        return true;
    }
}


