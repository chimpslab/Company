import { NextFunction, Request, Response } from "express";
import _ from "lodash";
import { tags } from "mustache";
import timezone from "../../data/timezone.json"
import { iOrganization, Organization, OrganizationDocument } from "../models/Organization";
import { Person } from "../models/Person";
import logger from "../util/logger";
import { OrganizationSearchOption } from "../util/search";
export const manage = (req: Request, res: Response) => {
    res.render("manage/organization", {
        title: "Organization",
        timezone 
    })
}

export const create = async (req: Request, res: Response, next: NextFunction) => {
    console.log("Organization Create Router Working");
    logger.debug(JSON.stringify(req.body))

    const newOrganization = new Organization ({
        name: req.body.name,
        image: req.body.image,
        legalName: req.body.legalName,
        telephone: req.body.telephone,
        mail: req.body.mail,
        languageCode: req.body.languageCode,
        billing: {
            country: req.body.billing_country,
            region: req.body.billing_region,
            city: req.body.billing_city,
            postalCode: req.body.billing_postalCode,
            streetAddress: req.body.billing_address
        },
        taxID: req.body.taxid,
        vatID: req.body.vatid,
        timezone: req.body.timezone,
        description: req.body.description,
        tags: req.body.tags.split(",")
    });

    if (req.body.contact) {
        const contact = await Person.findById(req.body.contact);
        if (contact) {
            newOrganization.contact = contact.id;
        }
    }

    newOrganization.save((error, document) => {
        if (error) {
            req.flash("errors", "Oups, an error occured");
            return next();
        }
        req.flash("success", "Organisation created with success");
        res.redirect(req.get("referer"));
    });
}

export const update = async (req: Request, res: Response, next: NextFunction) => {

    const orga: iOrganization = {
        name: req.body.name,
        image: req.body.image,
        legalName: req.body.legalName,
        telephone: req.body.telephone,
        mail: req.body.mail,
        languageCode: req.body.languageCode,
        billing: {
            country: req.body.billing_country,
            region: req.body.billing_region,
            city: req.body.billing_city,
            postalCode: req.body.billing_postalCode,
            streetAddress: req.body.billing_address
        },
        taxID: req.body.taxid,
        vatID: req.body.vatid,
        timezone: req.body.timezone,
        description: req.body.description,
        tags: req.body.tags.split(",")
    };

    if (req.body.contact) {
        const contact = await Person.findById(req.body.contact);
        if (contact) {
            orga.contact = contact.id;
        }
    }
    else {
        orga.contact = undefined;
    }

    Organization.updateOne({_id: req.body.id}, orga, null, (error, document) => {
        if (error) {
            req.flash("errors", "Oups, an error occured");
            return next();
        }
        
        req.flash("success", "Organisation updated with success");
        res.redirect(req.get("referer"));
    });
}

export const remove = (req: Request, res: Response, next: NextFunction) => {
    console.log("Organization Remove Router Working");
    res.end();
}

export const read = (req: Request, res: Response, next: NextFunction) => {
    console.log("Organization Read Router Working");
    const opt: OrganizationSearchOption = {
        id: req.query.id as string,
        limit: Math.min(Number(req.query.limit as string) || 25, 200),
        page: Number(req.query.page || 0),
        query: req.query.search as string || "",
        sortfield: "name",
        sortorder: 1,
        count: false,
    };

    if ( opt.id ) {
        Organization.findById(opt.id, null, null, (err, document) => {
            if (err) {
                req.flash("errors", "Organisation not found!");
                next();
            }
            return res.send(document);
        });
    }
    else {
        if (opt.query) {
            Organization.searchPartial( opt.query, (err, results) => {
                if (err) logger.error(err.message);
                return res.send({
                    items: results,
                    totalCount: results.length,
                    page: 0,
                    limit: results.length
                });
            });
        }
        const query = Organization.aggregate([
        ]);
        switch (opt.sortfield) {
            default:
            case "name":
                query.append({$sort: {"name": opt.sortorder}});
                break;
            case "short":
                query.append({$sort: {"short": opt.sortorder}});
                break;
        }
        
        query.collation({ locale: "en_US", strength: 1 })
        .skip(opt.page * opt.limit)
        .limit(opt.limit)
        .exec( (err, organisations: OrganizationDocument[]) => {
            if (err) {
                req.flash("errors", "Unexpexted Error");
                logger.debug(err.message);
                return res.send(req.flash());
            }
            Organization.estimatedDocumentCount({}, ( err, count) => {
                if (err) {
                    req.flash("errors", "Unexpexted Error");
                    logger.debug(err.message);
                    return res.send(req.flash());
                }
                return res.send({
                    items: organisations,
                    totalCount: count,
                    page: opt.page,
                    limit: opt.limit
                });
            });
        });
    }
}