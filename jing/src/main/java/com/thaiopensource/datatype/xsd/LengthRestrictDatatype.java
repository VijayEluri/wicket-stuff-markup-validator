package com.thaiopensource.datatype.xsd;

import org.relaxng.datatype.DatatypeException;

class LengthRestrictDatatype extends ValueRestrictDatatype {
  private final int length;
  private final Measure measure;

  LengthRestrictDatatype(DatatypeBase base, int length) {
    super(base);
    this.measure = base.getMeasure();
    this.length = length;
  }

   void checkRestriction(Object obj) throws DatatypeException {
    int actualLength = measure.getLength(obj);
    if (actualLength != length)
      throw new DatatypeException(localizer().message("length_violation",
                                                      new Object[] { getDescriptionForRestriction(), length, actualLength }));
  }
}
